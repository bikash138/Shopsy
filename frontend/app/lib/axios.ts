import axios from "axios";
import type { AxiosError } from "axios";

// Backend mounts everything under /api. Override per-environment with VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export const api = axios.create({
  baseURL,
  // Send the httpOnly auth cookie the backend sets on signin/signup.
  withCredentials: true,
});

// Error thrown by api calls — carries the backend message and HTTP status.
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Normalize axios errors so callers get the backend's { message } string.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong";
    return Promise.reject(new ApiError(message, error.response?.status));
  }
);
