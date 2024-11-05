import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "../types/user";

type Theme = "light" | "dark";

type State = {
  token: string;
  profile: Profile;
  isAuth: boolean;
  theme: Theme;
};

type Actions = {
  setToken: (token: string) => void;
  setProfile: (profile: Profile) => void;
  logout: () => void;
  toggleTheme: () => void;
};

export const useAuthStore = create(
  persist<State & Actions>(
    (set) => ({
      token: "",
      profile: null,
      isAuth: false,
      theme: "light",
      setToken: (token: string) =>
        set((state) => ({
          token,
          isAuth: true,
        })),
      setProfile: (profile: Profile) =>
        set((state) => ({
          profile,
        })),
      logout: () =>
        set((state) => ({
          token: "",
          isAuth: false,
          profile: null,
        })),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
    }),
    { name: "auth-store" }
  )
);
