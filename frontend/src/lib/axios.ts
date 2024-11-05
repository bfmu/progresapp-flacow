import axios from "axios";
import { useAuthStore } from "../store/auth";
import { enqueueSnackbar } from "notistack"; // Importa enqueueSnackbar desde notistack


const apiClient = axios.create({
  baseURL: import.meta.env.PUBLIC_API_BASE_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores globales
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        const logout = useAuthStore.getState().logout;
        switch (data.error) {
          case "token_missing":
          case "invalid_token":
            logout();
            window.location.href = "/app/login";
            break;

          case "token_expired":
            logout();
            break;

          default:
            logout();
        }
      }

      if (status === 403) {
        enqueueSnackbar("No tienes permiso para acceder a este recurso.", {
          variant: "warning",
        });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
