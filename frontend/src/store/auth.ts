import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "../types/user";

type State = {
  token: string;
  profile: Profile;
  isAuth: boolean;
};

type Actions = {
  setToken: (token: string) => void;
  setProfile: (profile: Profile) => void;
  logout: () => void;
};

export const useAuthStore = create(
  persist<State & Actions>(
    (set) => ({
      token: "",
      profile: null,
      isAuth: false,
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
    }),
    { name: "token" }
  )
);
