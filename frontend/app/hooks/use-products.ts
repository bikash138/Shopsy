import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi } from "~/api";
import type { ListProductsParams } from "~/api";
import { queryKeys } from "~/lib/query-keys";

// Public catalog listing with filters/pagination.
export function useProducts(params?: ListProductsParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => productsApi.list(params),
    // Keep showing the previous page while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ""),
    queryFn: () => productsApi.get(id as string),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: productsApi.categories,
    staleTime: 5 * 60 * 1000, // categories change rarely
  });
}
