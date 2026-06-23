# Shopsy

A full-stack marketplace where sellers list products and customers browse, cart, and pay — all in one place.

Built with React 19 · React Router v8 · Express 5 · MongoDB · Razorpay

---

## What is Shopsy?

Shopsy is a multi-role e-commerce platform. When you sign up you choose a role — **seller** or **customer** — and get a tailored experience from that point on.

- Sellers get a dashboard to manage their product catalogue and fulfil orders.
- Customers get a storefront, cart, checkout, and order tracking.
- Both share a public product catalogue, profile management, and the same authentication system.

---

## Features

### For Customers

#### Product Discovery
- Browse the full catalogue with search and category filters
- Paginated product grid (12 per page) with stock availability shown
- Detailed product page with seller info, description, and quantity selector

#### Shopping Cart
- Add products from the catalogue or product detail page
- Cart icon in the navbar with a live item-count badge
- Full cart page — adjust quantities, remove items, or clear everything
- Subtotal per line and running total

#### Checkout & Payment
- Place an order in one click — cart converts to an order automatically
- Integrated **Razorpay** payment modal (test mode ready)
- Order confirmed with a generated order ID on payment success

#### Order Tracking
- List of all past orders with status and payment badges
- Detailed order view: line items, quantities, subtotals, grand total
- Cancel an order while it is still in `processing` state — stock is automatically restored

---

### For Sellers

#### Product Management
- Dashboard table listing all your products with image, price, and stock at a glance
- Create a new product via a modal form (name, description, category, price, stock, image URL)
- Edit any product inline — changes reflect immediately
- Delete with a confirmation prompt

#### Order Fulfilment
- Separate orders view showing every order that contains your products
- Customer name and email visible per order
- Update order status via a dropdown: `processing → shipped → delivered`
- Cancelled orders are shown as read-only badges

---

### Shared Features

| Feature | Customer | Seller |
|---------|:--------:|:------:|
| Browse & search products | ✓ | ✓ |
| Filter by category | ✓ | ✓ |
| Product detail page | ✓ | ✓ |
| Profile & shipping address | ✓ | ✓ |
| Shopping cart | ✓ | — |
| Razorpay checkout | ✓ | — |
| Order history & detail | ✓ | — |
| Cancel processing order | ✓ | — |
| Product CRUD dashboard | — | ✓ |
| Order status management | — | ✓ |

---

## Tech Stack

### Frontend

| | Technology |
|-|------------|
| Framework | React 19 + React Router v8 (SSR) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Server state | TanStack React Query v5 |
| Client state | Zustand |
| Forms | React Hook Form |
| HTTP | Axios |
| Payments | Razorpay JS SDK |
| Notifications | Sonner (toasts) |
| Build | Vite |

### Backend

| | Technology |
|-|------------|
| Runtime | Bun |
| Framework | Express 5 |
| Language | TypeScript (strict) |
| Database | MongoDB 7 + Mongoose 9 |
| Auth | JWT (httpOnly cookies) |
| Passwords | bcryptjs |
| Validation | Zod v4 |
| Payments | Razorpay Node SDK |

### Infrastructure

| | Technology |
|-|------------|
| Database container | Docker Compose (mongo:7) |
| API port | 5000 |
| Frontend dev port | 5173 |
| MongoDB port | 27017 |

---

## Application Flow

```
                        ┌─────────────────────┐
                        │     Shopsy App       │
                        └──────────┬──────────┘
                                   │
                      ┌────────────┴────────────┐
                      │                         │
               Signs up as                Signs up as
                CUSTOMER                    SELLER
                      │                         │
          ┌───────────┼───────────┐             │
          ▼           ▼           ▼             ▼
       Browse      Add to      Track        Manage
      Products      Cart       Orders      Products
          │           │           │             │
          ▼           ▼           ▼             ▼
      Filter by   Adjust      View line    Create/Edit/
      category /  quantities  items &      Delete with
       search     & checkout  payment      stock control
                      │                         │
                      ▼                         ▼
                  Razorpay              Update order status
                  payment              processing→shipped
                  modal                    →delivered
```

---

## Project Structure

```
Shopsy/
├── frontend/                 # React 19 + React Router v8
│   ├── app/
│   │   ├── routes/           # Pages (home, products, cart, orders, seller)
│   │   ├── components/       # Reusable UI components
│   │   ├── layouts/          # Main layout + Seller dashboard layout
│   │   ├── hooks/            # React Query hooks per feature
│   │   ├── api/              # Axios API client
│   │   ├── lib/              # Auth helpers, formatters, query client
│   │   └── types/            # Shared TypeScript interfaces
│   └── package.json
│
├── backend/                  # Express 5 + MongoDB
│   ├── src/
│   │   ├── routes/           # Auth, profile, seller, customer, public
│   │   ├── services/         # Business logic per feature
│   │   ├── models/           # Mongoose schemas (User, Product, Order, Cart)
│   │   ├── middleware/       # JWT auth, role guard, Zod validation
│   │   ├── validators/       # Zod input schemas
│   │   └── utils/            # JWT, password, AppError
│   └── package.json
│
├── docker-compose.yml        # MongoDB container
└── README.md
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (backend runtime + package manager)
- [Node.js 20+](https://nodejs.org) (frontend)
- [Docker](https://www.docker.com) (for MongoDB)

### 1 — Start MongoDB

```bash
docker compose up -d
```

### 2 — Start the Backend

```bash
cd backend
bun install
bun run dev          # hot-reload on :5000
```

Optional: seed demo products and a seller account.

```bash
bun run seed
# Demo seller: demo.seller@shopsy.test / demo1234
```

### 3 — Start the Frontend

```bash
cd frontend
npm install
npm run dev          # Vite dev server on :5173
```

Open [http://localhost:5173](http://localhost:5173).

---

## Pages at a Glance

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing page — hero, featured products, onboarding steps |
| `/products` | Public | Full catalogue with search, filter, pagination |
| `/products/:id` | Public | Product detail with add-to-cart |
| `/signup` | Guest | Create a customer or seller account |
| `/signin` | Guest | Login |
| `/profile` | Auth | Update name and shipping address |
| `/cart` | Customer | Review cart, adjust quantities, proceed to checkout |
| `/orders` | Customer | Order history with status badges |
| `/orders/:id` | Customer | Order detail, pay, or cancel |
| `/seller` | Seller | Product management dashboard |
| `/seller/orders` | Seller | Order fulfilment dashboard |

---

## Environment Variables

**Backend** (`backend/.env`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/shopsy
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

**Frontend** (`frontend/.env`):

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Currency

All prices are displayed in **Indian Rupees (₹)**. The `formatPrice()` utility formats values using the `en-IN` locale.
