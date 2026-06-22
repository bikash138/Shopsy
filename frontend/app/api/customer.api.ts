import { api } from "~/lib/axios";
import type { Cart, Order } from "./types";

// Customer dashboard endpoints — require an authenticated customer.
export const customerApi = {
  // --- Cart ---
  getCart: () => api.get<Cart>("/customer/cart").then((r) => r.data),

  addToCart: (productId: string, quantity = 1) =>
    api
      .post<Cart>("/customer/cart/items", { productId, quantity })
      .then((r) => r.data),

  updateCartItem: (productId: string, quantity: number) =>
    api
      .patch<Cart>(`/customer/cart/items/${productId}`, { quantity })
      .then((r) => r.data),

  removeCartItem: (productId: string) =>
    api.delete<Cart>(`/customer/cart/items/${productId}`).then((r) => r.data),

  clearCart: () => api.delete<void>("/customer/cart").then((r) => r.data),

  // --- Orders ---
  placeOrder: () => api.post<Order>("/customer/orders").then((r) => r.data),

  listOrders: () => api.get<Order[]>("/customer/orders").then((r) => r.data),

  getOrder: (id: string) =>
    api.get<Order>(`/customer/orders/${id}`).then((r) => r.data),

  cancelOrder: (id: string) =>
    api.patch<Order>(`/customer/orders/${id}/cancel`).then((r) => r.data),
};
