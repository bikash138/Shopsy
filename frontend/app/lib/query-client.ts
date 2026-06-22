import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./axios";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 min before a background refetch.
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Don't retry auth/permission/not-found errors.
          const status = error instanceof ApiError ? error.status : undefined;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}
