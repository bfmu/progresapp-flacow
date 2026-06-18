import { createAuthStore } from "@progresapp/shared/store/auth";

// Web bootstrap: persist the auth store to localStorage.
// (Mobile instantiates createAuthStore with an expo-secure-store adapter.)
export const useAuthStore = createAuthStore(localStorage);
