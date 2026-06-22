import { api } from "~/lib/axios";
import type {
  Order,
  Product,
  ProductPayload,
  SellerOrderStatus,
  UpdateProductPayload,
} from "./types";

// Seller dashboard endpoints — require an authenticated seller.
export const sellerApi = {
  listProducts: () =>
    api.get<Product[]>("/seller/products").then((r) => r.data),

  createProduct: (payload: ProductPayload) =>
    api.post<Product>("/seller/products", payload).then((r) => r.data),

  updateProduct: (id: string, payload: UpdateProductPayload) =>
    api.patch<Product>(`/seller/products/${id}`, payload).then((r) => r.data),

  deleteProduct: (id: string) =>
    api.delete<void>(`/seller/products/${id}`).then((r) => r.data),

  listOrders: () => api.get<Order[]>("/seller/orders").then((r) => r.data),

  updateOrderStatus: (id: string, status: SellerOrderStatus) =>
    api
      .patch<Order>(`/seller/orders/${id}/status`, { status })
      .then((r) => r.data),
};
