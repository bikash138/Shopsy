import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { profileApi } from "~/api";
import type { UpdateProfilePayload } from "~/api";
import { queryKeys } from "~/lib/query-keys";

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.get,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileApi.update(payload),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.profile, updated);
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(error.message),
  });
}
