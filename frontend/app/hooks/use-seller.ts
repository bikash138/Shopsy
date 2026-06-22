import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sellerApi } from "~/api";
import type {
  ProductPayload,
  SellerOrderStatus,
  UpdateProductPayload,
} from "~/api";
import { queryKeys } from "~/lib/query-keys";

// --- Products ---

export function useSellerProducts() {
  return useQuery({
    queryKey: queryKeys.seller.products,
    queryFn: sellerApi.listProducts,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => sellerApi.createProduct(payload),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: queryKeys.seller.products });
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(`"${product.name}" created`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      sellerApi.updateProduct(id, payload),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: queryKeys.seller.products });
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success(`"${product.name}" updated`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sellerApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.seller.products });
      qc.invalidateQueries({ queryKey: queryKeys.products.all });
      toast.success("Product deleted");
    },
    onError: (error) => toast.error(error.message),
  });
}

// --- Orders ---

export function useSellerOrders() {
  return useQuery({
    queryKey: queryKeys.seller.orders,
    queryFn: sellerApi.listOrders,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SellerOrderStatus }) =>
      sellerApi.updateOrderStatus(id, status),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: queryKeys.seller.orders });
      toast.success(`Order marked as ${order.orderStatus}`);
    },
    onError: (error) => toast.error(error.message),
  });
}
