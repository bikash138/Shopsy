import { api } from "~/lib/axios";
import type {
  AuthResponse,
  AuthSession,
  SigninPayload,
  SignupPayload,
} from "./types";

export const authApi = {
  signup: (payload: SignupPayload) =>
    api.post<AuthResponse>("/auth/signup", payload).then((r) => r.data),

  signin: (payload: SigninPayload) =>
    api.post<AuthResponse>("/auth/signin", payload).then((r) => r.data),

  signout: () =>
    api.post<{ message: string }>("/auth/signout").then((r) => r.data),

  me: () =>
    api.get<{ user: AuthSession }>("/auth/me").then((r) => r.data.user),
};
