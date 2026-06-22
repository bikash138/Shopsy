import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("layouts/main-layout.tsx", [
    index("routes/home.tsx"),
    route("signin", "routes/signin.tsx"),
    route("signup", "routes/signup.tsx"),
    route("profile", "routes/profile.tsx"),

    // Public catalog
    route("products", "routes/products.tsx"),
    route("products/:id", "routes/product-detail.tsx"),

    // Customer
    route("cart", "routes/cart.tsx"),
    route("orders", "routes/orders.tsx"),
    route("orders/:id", "routes/order-detail.tsx"),

    // Seller dashboard
    layout("layouts/seller-layout.tsx", [
      route("seller", "routes/seller/products.tsx"),
      route("seller/orders", "routes/seller/orders.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
