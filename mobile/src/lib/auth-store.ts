import { createAuthStore } from "@progresapp/shared/store/auth";
import { secureStorage } from "./storage";

/**
 * Auth store persisted via `expo-secure-store` (iOS Keychain / Android
 * Keystore) — keeps the JWT out of plain AsyncStorage.
 *
 * Lives in its own module (separate from `App.tsx`) so screens can import
 * `useAuthStore` without creating a circular dependency on the app's root
 * component.
 */
export const useAuthStore = createAuthStore(secureStorage);
