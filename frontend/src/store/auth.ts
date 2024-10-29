import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "../types/user";

type State = {
  token: string;
  profile: Profile;
};

type Actions = {
  setToken: (token: string) => void;
  setProfile: (profile: Profile) => void;
};

export const useAuthStore = create(
  persist<State & Actions>(
    (set) => ({
      token: "",
      profile: null,
      setToken: (token: string) =>
        set((state) => ({
          token,
        })),
      setProfile: (profile: Profile) =>
        set((state) => ({
          profile,
        })),
    }),
    { name: "token" }
  )
);
