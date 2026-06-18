import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

/**
 * Adapts an async key-value SDK (matching the shape of either
 * `expo-secure-store` or `@react-native-async-storage/async-storage`) to
 * Zustand's `StateStorage` interface, which `persist` supports natively
 * via async `getItem`/`setItem`/`removeItem`.
 */
const createAsyncStateStorage = (sdk: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}): StateStorage => ({
  getItem: (name) => sdk.getItem(name),
  setItem: (name, value) => sdk.setItem(name, value),
  removeItem: (name) => sdk.removeItem(name),
});

/**
 * `StateStorage` adapter backed by `expo-secure-store` (iOS Keychain /
 * Android Keystore). Used for sensitive data — the auth store's JWT.
 */
export const secureStorage: StateStorage = createAsyncStateStorage({
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
});

/**
 * `StateStorage` adapter backed by `@react-native-async-storage/async-storage`.
 * Used for non-sensitive persisted state (timer prefs, theme).
 */
export const asyncStorage: StateStorage = createAsyncStateStorage({
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
});
