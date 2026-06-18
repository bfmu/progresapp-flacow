import "./global.css";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { createApiClient, setApiClient } from "@progresapp/shared/api/client";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useAuthStore } from "./src/lib/auth-store";

/**
 * Resolves the API base URL from `app.config.js` `extra.apiBaseUrl`
 * (populated from `EXPO_PUBLIC_API_BASE_URL`), falling back to the raw
 * env var and finally a localhost default for dev.
 */
const API_BASE_URL =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://localhost:3000/api";

export { useAuthStore };

/**
 * Shared axios instance. `onUnauthorized` clears the session; the
 * `RootNavigator` reacts to `isAuth` becoming false and switches to the
 * auth stack automatically (no imperative navigation reset needed here).
 */
export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => {
    useAuthStore.getState().logout();
  },
});

// Registers `apiClient` as the instance used by `@progresapp/shared/api/*`
// modules' `import apiClient from "./client"` default export (see
// `packages/shared/src/api/client.ts`'s `setApiClient`/proxy).
setApiClient(apiClient);

export default function App() {
  const [isAuth, setIsAuth] = useState(useAuthStore.getState().isAuth);
  // `persist` rehydrates the auth store from SecureStore asynchronously. Until
  // that finishes, `isAuth` reflects the store's *default* (logged-out) state,
  // which would briefly render the Login stack even for a user with a valid
  // session (mobile-auth Scenario: App relaunch with valid session). Gate
  // rendering on `hasHydrated` to avoid that flash.
  const [hasHydrated, setHasHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // Keep local state in sync with the persisted auth store so the
    // navigator switches stacks on login/logout without a full remount
    // of the provider tree.
    return useAuthStore.subscribe((state) => setIsAuth(state.isAuth));
  }, []);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
  }, []);

  if (!hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator testID="bootstrap-loading-indicator" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator isAuthenticated={isAuth} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
