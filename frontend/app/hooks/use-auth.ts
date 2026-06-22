import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success(`Welcome back, ${data.user.name}`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.me });
      toast.success(`Account created — welcome, ${data.user.name}`);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useSignout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.signout(),
    // Drop all cached data so no stale per-user data lingers after logout.
    onSuccess: () => {
      qc.clear();
      toast.success("Signed out");
    },
    onError: (error) => toast.error(error.message),
  });
}
