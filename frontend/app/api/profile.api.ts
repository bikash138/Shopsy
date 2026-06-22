import { api } from "~/lib/axios";
import type { UpdateProfilePayload, UserProfile } from "./types";

export const profileApi = {
  get: () => api.get<UserProfile>("/profile").then((r) => r.data),

  update: (payload: UpdateProfilePayload) =>
    api.patch<UserProfile>("/profile", payload).then((r) => r.data),
};
