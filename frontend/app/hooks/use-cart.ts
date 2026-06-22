import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "~/api";
import type { Cart } from "~/api";
import { queryKeys } from "~/lib/query-keys";

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: customerApi.getCart,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      customerApi.addToCart(productId, quantity),
    onSuccess: (cart) => qc.setQueryData<Cart>(queryKeys.cart, cart),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      customerApi.updateCartItem(productId, quantity),
    onSuccess: (cart) => qc.setQueryData<Cart>(queryKeys.cart, cart),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => customerApi.removeCartItem(productId),
    onSuccess: (cart) => qc.setQueryData<Cart>(queryKeys.cart, cart),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customerApi.clearCart(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.cart }),
  });
}
