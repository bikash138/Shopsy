import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customerApi } from "~/api";
import { queryKeys } from "~/lib/query-keys";

export function useCustomerOrders() {
  return useQuery({
    queryKey: queryKeys.customerOrders.all,
    queryFn: customerApi.listOrders,
  });
}

export function useCustomerOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.customerOrders.detail(id ?? ""),
    queryFn: () => customerApi.getOrder(id as string),
    enabled: !!id,
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => customerApi.placeOrder(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.customerOrders.all });
      // Checkout empties the cart on the backend.
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      toast.success("Order placed successfully");
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.cancelOrder(id),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: queryKeys.customerOrders.all });
      qc.invalidateQueries({ queryKey: queryKeys.customerOrders.detail(order._id) });
      // Cancelling restores product stock.
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success("Order cancelled");
    },
    onError: (error) => toast.error(error.message),
  });
}
