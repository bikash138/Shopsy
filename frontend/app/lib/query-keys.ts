import type { ListProductsParams } from "~/api";

// Central registry of query keys so hooks and invalidations stay in sync.
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  profile: ["profile"] as const,
  products: {
    all: ["products"] as const,
    list: (params?: ListProductsParams) => ["products", "list", params ?? {}] as const,
    detail: (id: string) => ["products", "detail", id] as const,
    categories: ["products", "categories"] as const,
  },
  seller: {
    products: ["seller", "products"] as const,
    orders: ["seller", "orders"] as const,
  },
  cart: ["cart"] as const,
  customerOrders: {
    all: ["customer", "orders"] as const,
    detail: (id: string) => ["customer", "orders", id] as const,
  },
} as const;
