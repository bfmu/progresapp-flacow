import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { Profile } from "../types/user";
import { PERSIST_KEYS } from "./constants";

type Theme = "light" | "dark";

export type AuthState = {
  token: string;
  profile: Profile;
  isAuth: boolean;
  theme: Theme;
};

export type AuthActions = {
  setToken: (token: string) => void;
  setProfile: (profile: Profile) => void;
  logout: () => void;
  toggleTheme: () => void;
};

export type AuthStore = AuthState & AuthActions;

/**
 * Creates an auth Zustand store with persistence backed by the given
 * StateStorage adapter.
 *
 * - Web: `createJSONStorage(() => localStorage)`
 * - Mobile: an `expo-secure-store`-backed adapter
 */
export const createAuthStore = (storage: StateStorage) =>
  create(
    persist<AuthStore>(
      (set) => ({
        token: "",
        profile: null,
        isAuth: false,
        theme: "dark",
        setToken: (token: string) =>
          set(() => ({
            token,
            isAuth: true,
          })),
        setProfile: (profile: Profile) =>
          set(() => ({
            profile,
          })),
        logout: () =>
          set(() => ({
            token: "",
            isAuth: false,
            profile: null,
          })),
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === "light" ? "dark" : "light",
          })),
      }),
      {
        name: PERSIST_KEYS.auth,
        storage: createJSONStorage(() => storage),
      }
    )
  );
