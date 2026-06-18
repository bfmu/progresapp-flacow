import type { StateStorage } from "zustand/middleware";
import { createAuthStore } from "../auth";

/**
 * Minimal in-memory StateStorage implementation for testing the
 * createAuthStore(storage) factory without depending on a real
 * localStorage / AsyncStorage / SecureStore adapter.
 */
const createMemoryStorage = (): StateStorage => {
  const store = new Map<string, string>();
  return {
    getItem: (name) => store.get(name) ?? null,
    setItem: (name, value) => {
      store.set(name, value);
    },
    removeItem: (name) => {
      store.delete(name);
    },
  };
};

describe("createAuthStore(storage)", () => {
  it("starts with an empty, unauthenticated session", () => {
    const useAuthStore = createAuthStore(createMemoryStorage());
    const state = useAuthStore.getState();

    expect(state.token).toBe("");
    expect(state.isAuth).toBe(false);
    expect(state.profile).toBeNull();
  });

  it("setToken stores the token and marks the session as authenticated", () => {
    const useAuthStore = createAuthStore(createMemoryStorage());

    useAuthStore.getState().setToken("jwt-token-123");
    const state = useAuthStore.getState();

    expect(state.token).toBe("jwt-token-123");
    expect(state.isAuth).toBe(true);
  });

  it("logout clears the token, profile, and authentication flag", () => {
    const useAuthStore = createAuthStore(createMemoryStorage());

    useAuthStore.getState().setToken("jwt-token-123");
    useAuthStore.getState().setProfile({
      name: "Test User",
      email: "test@example.com",
      roles: ["user"],
    });

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();

    expect(state.token).toBe("");
    expect(state.isAuth).toBe(false);
    expect(state.profile).toBeNull();
  });

  it("persists state through the injected storage adapter", async () => {
    const storage = createMemoryStorage();
    const useAuthStore = createAuthStore(storage);

    useAuthStore.getState().setToken("persisted-token");

    // Allow the persist middleware's async write to flush.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const raw = await storage.getItem("auth-store");
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).state.token).toBe("persisted-token");
  });
});
