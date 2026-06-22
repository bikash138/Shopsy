import { api } from "~/lib/axios";
import type { ListProductsParams, Product, ProductListResponse } from "./types";

// Public catalog endpoints — no authentication required.
export const productsApi = {
  list: (params?: ListProductsParams) =>
    api.get<ProductListResponse>("/products", { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Product>(`/products/${id}`).then((r) => r.data),

  categories: () => api.get<string[]>("/categories").then((r) => r.data),
};
