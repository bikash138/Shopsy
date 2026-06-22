import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env (no prefix filter) so we can read non-VITE_ server-side config.
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl = env.BACKEND_URL ?? "http://localhost:5000";

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      // Proxy API calls to the backend so the frontend and backend share an
      // origin in dev. This makes the auth cookie first-party, so SSR loaders
      // receive it and can forward it to the backend.
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
