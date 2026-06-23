# Shopsy — Backend API

A RESTful e-commerce backend with dual-role support (seller & customer), shopping cart, order management, and role-based access control.

**Stack:** Bun · Express 5 · TypeScript · MongoDB · Mongoose · JWT · Zod

---

## Tech Stack

### Runtime & Package Manager

| Tool | Version | Purpose |
|------|---------|---------|
| [Bun](https://bun.sh) | latest | JavaScript runtime, package manager, and test runner — replaces Node + npm/yarn. Used for `bun run dev` (hot-reload via `--watch`) and `bun run seed`. Significantly faster installs and cold starts than Node. |

### Server & Framework

| Tool | Version | Purpose |
|------|---------|---------|
| [Express](https://expressjs.com) | 5.x | HTTP server and routing. v5 adds native async error propagation — no need to wrap handlers in `try/catch` and call `next(err)` manually. |
| [TypeScript](https://www.typescriptlang.org) | latest | Strict static typing across the entire codebase. Compiled to ESNext targeting Bun's runtime. |
| [cors](https://github.com/expressjs/cors) | 2.8.x | Enables cross-origin requests with credentials (needed for cookie-based auth from the frontend). |
| [cookie-parser](https://github.com/expressjs/cookie-parser) | 1.4.x | Parses incoming `Cookie` headers so `req.cookies.token` is accessible in middleware. |

### Database & ODM

| Tool | Version | Purpose |
|------|---------|---------|
| [MongoDB](https://www.mongodb.com) | 7+ | Document database. Chosen for its flexible schema — particularly useful for the nested `address` object on users and the `products[]` / `items[]` arrays on orders and carts. |
| [Mongoose](https://mongoosejs.com) | 9.x | ODM for MongoDB. Provides schema definitions, model types, middleware hooks, and query building. All four collections (User, Product, Order, Cart) are modelled here. |

### Authentication & Security

| Tool | Version | Purpose |
|------|---------|---------|
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9.x | Signs and verifies JWT tokens (HS256 algorithm). Tokens are issued on signup/signin and expire after 7 days (configurable). |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.x | Hashes passwords before storing them (10 salt rounds). Pure JS implementation — no native bindings needed. The `password` field uses Mongoose's `select: false` so it is never returned in queries unless explicitly included. |
| httpOnly Cookies | — | JWT is stored in an httpOnly cookie rather than `localStorage`, preventing XSS-based token theft. The `auth.middleware.ts` reads from `req.cookies.token`. |

### Validation & Type Safety

| Tool | Version | Purpose |
|------|---------|---------|
| [Zod](https://zod.dev) | 4.x | Schema-first runtime validation. Every route has a corresponding Zod schema in `src/validators/`. The `validate.ts` middleware runs the schema against `req.body`, `req.params`, or `req.query` and returns structured field-level 400 errors on failure. Also used in `src/config/env.ts` to validate and type environment variables at startup. |

### Payments _(wired, not yet implemented)_

| Tool | Version | Purpose |
|------|---------|---------|
| [Razorpay](https://razorpay.com/docs) | 2.9.x | Installed and listed in `package.json`. Integration point is the `paymentStatus` field on orders (`pending → paid → refunded`). Implementation is pending. |

### Architecture Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **Layered architecture** | `routes → services → models` | Routes handle HTTP concerns; services own business logic; models own persistence. Keeps handlers thin and logic testable. |
| **Role-based access control** | `auth.middleware.ts` | A single `requireRole(...roles)` guard protects seller and customer route groups. Roles are stored on the JWT payload and verified on every request. |
| **Price snapshotting** | `order.model.ts` | Order items store `name` and `price` at checkout time so historical order values are never affected by future product edits. |
| **AppError class** | `utils/AppError.ts` | A typed error with `statusCode` propagated through Express's error handler, so all error responses share a consistent shape. |

---

## Development Methodology

### Layered Architecture

Every feature follows the same three-layer flow with no shortcuts between layers:

```
HTTP Layer          Business Logic Layer      Persistence Layer
─────────────       ────────────────────      ─────────────────
routes/*.ts    ──►  services/**/*.ts     ──►  models/*.ts
                                              (Mongoose + MongoDB)
```

- **Routes** own only HTTP concerns: parsing the request, calling the service, and sending the response. They hold no business logic.
- **Services** own all domain logic: validation outcomes, stock checks, price snapshotting, cart-to-order conversion. They know nothing about `req` or `res`.
- **Models** own the data shape and persistence. Mongoose schemas enforce field types, constraints, and indexes at the DB level.

This boundary means services are independently testable without spinning up an HTTP server.

---

### Schema-First, Types-Down

The type hierarchy flows from Zod → TypeScript → Mongoose, not the other way around:

```
Zod validator schema  (src/validators/)
        │
        │  .parse() at request boundary
        ▼
TypeScript interface  (src/types/)
        │
        │  passed into service functions
        ▼
Mongoose model        (src/models/)
        │
        │  persisted to MongoDB
        ▼
    Database
```

Zod validates and narrows the shape at the HTTP boundary. TypeScript types are derived from Zod schemas where possible so there is a single source of truth. Mongoose schemas repeat only what the database needs to enforce (indexes, defaults, enums).

---

### Validation Strategy

All input validation is centralised in `src/validators/` and applied by the `validate.ts` middleware **before** the route handler runs. This means:

- Route handlers can assume the request body/params/query are already the correct shape.
- Validation errors are always 400 responses with consistent field-level error messages.
- No ad-hoc checks scattered through business logic.

```
Request arrives
      │
      ▼
validate(schema)  ◄── Zod schema from src/validators/
      │
   invalid ──► 400 { errors: [{ field, message }] }
      │
    valid
      │
      ▼
route handler (data is trusted here)
```

Environment variables go through the same treatment — `src/config/env.ts` runs a Zod parse at startup and throws immediately if anything is missing or malformed, so misconfiguration fails fast rather than at runtime.

---

### Error Handling

All errors funnel into a single `error.middleware.ts` at the bottom of the Express middleware chain. Three error shapes are handled:

| Source | Detected by | Response |
|--------|-------------|----------|
| `AppError` (intentional) | `instanceof AppError` | `{ message }` with the error's own `statusCode` |
| Zod validation failure | `instanceof ZodError` | `400` with field-level messages |
| MongoDB duplicate key | `err.code === 11000` | `409` with a human-readable field name |
| Anything else | fallthrough | `500 Internal Server Error` |

Throwing `new AppError("Not found", 404)` anywhere in a service or route is sufficient — Express 5's native async propagation catches it without `try/catch` wrappers.

---

### Role-Based Access Control

Access is enforced at the route-group level, not inside individual handlers:

```
/api
 ├── /auth      — public (no middleware)
 ├── /products  — public (no middleware)
 ├── /profile   — requireAuth
 ├── /seller    — requireAuth + requireRole("seller")
 └── /customer  — requireAuth + requireRole("customer")
```

`requireRole` reads the `role` from the verified JWT payload. A customer hitting a seller route gets a `403` before the route handler is ever invoked. This makes the access model easy to audit — one place per route group, not guarded individually per endpoint.

---

### Inventory Integrity

Stock is managed as a transactional-style sequence within the checkout service:

1. Read current stock for all cart items in a single pass.
2. Reject the entire order if **any** item is under-stocked (no partial orders).
3. Decrement stock for each item atomically using Mongoose's `$inc` operator.
4. Create the order with snapshotted prices.
5. Clear the cart.

On cancellation the same service restores stock with `$inc` in the opposite direction, ensuring no inventory is silently lost.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Schema & ERD](#database-schema--erd)
- [API Reference](#api-reference)
- [Request & Auth Flow](#request--auth-flow)
- [Order Lifecycle](#order-lifecycle)
- [Environment Variables](#environment-variables)
- [Seed Data](#seed-data)

---

## Getting Started

```bash
# Install dependencies
bun install

# Copy and configure environment
cp .env.example .env

# Seed demo data (optional)
bun run seed

# Start development server (hot-reload)
bun run dev

# Start production server
bun run start
```

Server starts at `http://localhost:5000`.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.ts              # MongoDB connection
│   │   └── env.ts             # Zod-validated env config
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification + role guard
│   │   ├── error.middleware.ts # Global error handler
│   │   └── validate.ts        # Zod request validation
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── order.model.ts
│   │   └── cart.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── profile.routes.ts
│   │   ├── seller.routes.ts
│   │   ├── customer.routes.ts
│   │   └── public.routes.ts
│   ├── services/
│   │   ├── auth/
│   │   ├── public/
│   │   ├── profile/
│   │   ├── seller-dashboard/
│   │   └── customer-dashboard/
│   ├── types/                 # Shared TypeScript interfaces
│   ├── utils/                 # jwt, password, AppError
│   ├── validators/            # Zod input schemas
│   ├── index.ts               # App entry point
│   └── seed.ts                # Database seeder
├── package.json
└── tsconfig.json
```

---

## Database Schema & ERD

### Entity Relationship Diagram

```
┌──────────────────────────────┐
│            User              │
├──────────────────────────────┤
│ _id        ObjectId (PK)     │
│ name       String            │
│ email      String (unique)   │
│ password   String (hashed)   │
│ role       seller | customer │
│ address    Object?           │
│   street   String?           │
│   city     String?           │
│   state    String?           │
│   postalCode String?         │
│   country  String?           │
│ createdAt  Date              │
│ updatedAt  Date              │
└──────────┬─────────┬─────────┘
           │         │
           │ 1:N     │ 1:1
           │         │
           ▼         ▼
┌───────────────┐   ┌───────────────────────────┐
│    Product    │   │            Cart           │
├───────────────┤   ├───────────────────────────┤
│ _id    ObjId  │   │ _id       ObjectId (PK)   │
│ name   String │   │ user      ObjectId (FK)   │◄── 1:1 with User
│ desc   String │   │ items[]                   │
│ category Str  │   │   product  ObjectId (FK)  │──►┐
│ price  Number │◄──│   quantity Number         │   │
│ stock  Number │   │ createdAt  Date           │   │
│ image  String │   │ updatedAt  Date           │   │
│ seller ObjId  │   └───────────────────────────┘   │
│        (FK)   │◄──────────────────────────────────┘
│ createdAt Date│
│ updatedAt Date│
└───────┬───────┘
        │
        │ M:N (snapshot)
        │
        ▼
┌──────────────────────────────────────┐
│                Order                 │
├──────────────────────────────────────┤
│ _id           ObjectId (PK)          │
│ customer      ObjectId (FK) ─────────┼──► User
│ products[]                           │
│   product     ObjectId (FK) ─────────┼──► Product (ref only)
│   name        String (snapshot)      │
│   price       Number (snapshot)      │
│   quantity    Number                 │
│ totalAmount   Number                 │
│ paymentStatus pending|paid|          │
│               failed|refunded        │
│ orderStatus   processing|shipped|    │
│               delivered|cancelled    │
│ createdAt     Date                   │
│ updatedAt     Date                   │
└──────────────────────────────────────┘
```

### Relationships at a Glance

| From  | To      | Type | Description                              |
| ----- | ------- | ---- | ---------------------------------------- |
| User  | Product | 1:N  | A seller owns many products              |
| User  | Cart    | 1:1  | Each customer has one persistent cart    |
| User  | Order   | 1:N  | A customer can place many orders         |
| Cart  | Product | M:N  | Cart holds many products with quantities |
| Order | Product | M:N  | Order snapshots product data at checkout |

### Schema Details

#### User

| Field    | Type   | Constraints                   |
| -------- | ------ | ----------------------------- |
| email    | String | unique, lowercase, required   |
| password | String | bcrypt-hashed, `select:false` |
| role     | Enum   | `seller` \| `customer`        |
| address  | Object | all sub-fields optional       |

#### Product

| Field    | Type   | Constraints             |
| -------- | ------ | ----------------------- |
| name     | String | indexed, required       |
| category | String | indexed (for filtering) |
| price    | Number | min: 0                  |
| stock    | Number | min: 0, default: 0      |
| seller   | ObjId  | ref: User, indexed      |

#### Order

| Field            | Type   | Default      | Notes                        |
| ---------------- | ------ | ------------ | ---------------------------- |
| products[].price | Number | —            | Snapshot at checkout time    |
| paymentStatus    | Enum   | `pending`    | Updated via payment provider |
| orderStatus      | Enum   | `processing` | Seller updates this          |

#### Cart

| Field            | Type   | Constraints                |
| ---------------- | ------ | -------------------------- |
| user             | ObjId  | unique (one cart per user) |
| items[].quantity | Number | min: 1                     |

---

## API Reference

**Base URL:** `http://localhost:5000/api`

### Health

| Method | Path      | Auth | Description    |
| ------ | --------- | ---- | -------------- |
| GET    | `/health` | No   | Liveness check |

### Authentication — `/auth`

| Method | Path            | Auth     | Description                        |
| ------ | --------------- | -------- | ---------------------------------- |
| POST   | `/auth/signup`  | No       | Register (seller or customer)      |
| POST   | `/auth/signin`  | No       | Login, returns httpOnly JWT cookie |
| POST   | `/auth/signout` | Required | Clears auth cookie                 |
| GET    | `/auth/me`      | Required | Returns current user               |

**Signup body:**

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "role": "customer"
}
```

### Profile — `/profile`

| Method | Path       | Auth     | Description         |
| ------ | ---------- | -------- | ------------------- |
| GET    | `/profile` | Required | Get profile         |
| PATCH  | `/profile` | Required | Update name/address |

### Seller Dashboard — `/seller` _(role: seller)_

| Method | Path                        | Description                    |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/seller/products`          | List own products              |
| POST   | `/seller/products`          | Create product                 |
| PATCH  | `/seller/products/:id`      | Update product                 |
| DELETE | `/seller/products/:id`      | Delete product (204)           |
| GET    | `/seller/orders`            | Orders containing own products |
| PATCH  | `/seller/orders/:id/status` | Update order status            |

**Create product body:**

```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling, 30hr battery",
  "category": "Electronics",
  "price": 149.99,
  "stock": 50,
  "image": "https://..."
}
```

**Update order status body:**

```json
{ "status": "shipped" }
```

> Allowed transitions: `processing` → `shipped` → `delivered`

### Customer Dashboard — `/customer` _(role: customer)_

#### Cart

| Method | Path                              | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | `/customer/cart`                  | Get cart (auto-created)       |
| POST   | `/customer/cart/items`            | Add item                      |
| PATCH  | `/customer/cart/items/:productId` | Update quantity (0 = removes) |
| DELETE | `/customer/cart/items/:productId` | Remove item                   |
| DELETE | `/customer/cart`                  | Clear cart (204)              |

**Add item body:**

```json
{ "productId": "...", "quantity": 2 }
```

#### Orders

| Method | Path                          | Description             |
| ------ | ----------------------------- | ----------------------- |
| POST   | `/customer/orders`            | Checkout (cart → order) |
| GET    | `/customer/orders`            | List own orders         |
| GET    | `/customer/orders/:id`        | Order details           |
| PATCH  | `/customer/orders/:id/cancel` | Cancel processing order |

### Public Catalog — no auth

| Method | Path            | Description                       |
| ------ | --------------- | --------------------------------- |
| GET    | `/products`     | Browse products (filter/paginate) |
| GET    | `/products/:id` | Product detail                    |
| GET    | `/categories`   | All available categories          |

**Browse query params:**

| Param    | Type   | Example                 |
| -------- | ------ | ----------------------- |
| category | string | `?category=Electronics` |
| search   | string | `?search=headphones`    |
| minPrice | number | `?minPrice=10`          |
| maxPrice | number | `?maxPrice=200`         |
| page     | number | `?page=2`               |
| limit    | number | `?limit=20` (max 100)   |

---

## Request & Auth Flow

```
Client Request
      │
      ▼
 Express Router
      │
      ├──► Public Routes ──────────────────────────► Service ──► MongoDB
      │
      └──► Protected Routes
                │
                ▼
          auth.middleware
           (verify JWT)
                │
           ┌────┴──────┐
           │ Valid?    │
           │           │
          Yes          No ──► 401 Unauthorized
           │
           ▼
         role guard (if needed)
           │
          ┌┴──────────┐
          │ Correct   │
          │ role?     │
         Yes          No ──► 403 Forbidden
          │
          ▼
        validate.ts (Zod schema)
          │
         ┌┴──────────┐
         │ Valid?    │
         │           │
        Yes          No ──► 400 Bad Request (field-level errors)
         │
         ▼
       Route handler ──► Service ──► MongoDB
                │
                ▼
         error.middleware
    (AppError · ZodError · Mongo duplicates)
```

### Token Lifecycle

```
Signup / Signin
      │
      ▼
 JWT signed (HS256, 7d expiry)
      │
      ▼
 Set as httpOnly cookie  ←── XSS-safe; JS cannot read it
      │
      ▼
 Browser sends cookie automatically on every request
      │
      ▼
 auth.middleware verifies & attaches user to req.user
      │
      ▼
 Signout clears cookie
```

---

## Order Lifecycle

```
 Customer adds items to Cart
          │
          ▼
 POST /customer/orders  (checkout)
          │
          ├─ Validate all items are in stock
          ├─ Snapshot product name & price
          ├─ Decrement stock for each item
          ├─ Create Order  (paymentStatus: pending)
          └─ Clear cart
          │
          ▼
     Order Created
  orderStatus: processing
          │
          ├───────────────────────────────────┐
          ▼                                   ▼
   Seller updates status           Customer / Seller cancels
          │                                   │
     processing                               ├─ Restore stock
          │                                   ├─ paymentStatus → refunded
          ▼                                   │  (if previously paid)
       shipped                                └─ orderStatus → cancelled
          │
          ▼
       delivered


Payment Status:
  pending ──► paid
              ├──► refunded  (on cancellation)
              └──► failed
```

---

## Environment Variables

| Variable         | Default                            | Description               |
| ---------------- | ---------------------------------- | ------------------------- |
| `PORT`           | `5000`                             | Server port               |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/shopsy` | MongoDB connection string |
| `JWT_SECRET`     | _(change in production)_           | Secret for signing tokens |
| `JWT_EXPIRES_IN` | `7d`                               | Token TTL                 |
| `NODE_ENV`       | `development`                      | Environment mode          |

---

## Seed Data

Populates the database with a demo seller and 10 products across 5 categories.

```bash
bun run seed
```

**Demo Seller:**

```
Email:    demo.seller@shopsy.test
Password: demo1234
```

**Seeded Categories:** Electronics · Apparel · Home · Books · Accessories
