import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "~/api";
import type { SigninPayload, SignupPayload } from "~/api";
import { queryKeys } from "~/lib/query-keys";

// Current session (decoded JWT). Errors with 401 when logged out.
export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    retry: false,
  });
}

export function useSignin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SigninPayload) => authApi.signin(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.auth.me }),
  });
}

export function useSignout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.signout(),
    // Drop all cached data so no stale per-user data lingers after logout.
    onSuccess: () => qc.clear(),
  });
}
