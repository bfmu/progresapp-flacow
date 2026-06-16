import { createApiClient, setApiClient } from "@progresapp/shared/api/client";
import { useAuthStore } from "../store/auth";
import { enqueueSnackbar } from "notistack"; // Importa enqueueSnackbar desde notistack

const apiClient = createApiClient({
  baseURL: import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: (reason) => {
    useAuthStore.getState().logout();

    // For token_expired we keep the user on the current screen (no redirect
    // loop); for a missing/invalid token we send them back to login.
    if (reason !== "token_expired") {
      window.location.href = "/app/login";
    }
  },
  onForbidden: () => {
    enqueueSnackbar("No tienes permiso para acceder a este recurso.", {
      variant: "warning",
    });
  },
});

// Registers `apiClient` as the instance used by `@progresapp/shared/api/*`
// modules' `import apiClient from "./client"` default export (see
// `packages/shared/src/api/client.ts`'s `setApiClient`/proxy).
setApiClient(apiClient);

export default apiClient;
