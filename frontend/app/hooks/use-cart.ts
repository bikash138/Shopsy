import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onSuccess: (cart) => {
      qc.setQueryData<Cart>(queryKeys.cart, cart);
      toast.success("Added to cart");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      customerApi.updateCartItem(productId, quantity),
    // No success toast — this fires on every quantity tweak and would be noisy.
    onSuccess: (cart) => qc.setQueryData<Cart>(queryKeys.cart, cart),
    onError: (error) => toast.error(error.message),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => customerApi.removeCartItem(productId),
    onSuccess: (cart) => {
      qc.setQueryData<Cart>(queryKeys.cart, cart);
      toast.success("Removed from cart");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customerApi.clearCart(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success("Cart cleared");
    },
    onError: (error) => toast.error(error.message),
  });
}
