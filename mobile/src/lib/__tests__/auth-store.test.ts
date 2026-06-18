/**
 * Session-restore (rehydration) behavior of the SecureStore-backed auth
 * store, covering mobile-auth scenarios:
 * - "App relaunch with valid session": a persisted token/isAuth state in
 *   SecureStore is restored into the store on rehydration.
 * - "Expired session": no persisted state (or a cleared session) leaves the
 *   store in its logged-out default after rehydration.
 *
 * `expo-secure-store` and `@react-native-async-storage/async-storage` are
 * mocked so this can run under the isolated ts-jest harness (no RN runtime
 * needed — `createAuthStore` + `persist`/`createJSONStorage` are plain JS).
 */

const mockSecureStore = {
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
};

jest.mock("expo-secure-store", () => mockSecureStore);

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const PERSIST_KEY = "auth-store";

const waitForHydration = (store: typeof import("../auth-store").useAuthStore) =>
  new Promise<void>((resolve) => {
    if (store.persist.hasHydrated()) {
      resolve();
      return;
    }
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });

describe("useAuthStore session restore (rehydration)", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("restores a persisted valid session (token + isAuth) on rehydration", async () => {
    const persisted = JSON.stringify({
      state: {
        token: "jwt-from-securestore",
        isAuth: true,
        profile: { id: "1", full_name: "Jane Doe", email: "jane@example.com" },
        theme: "dark",
      },
      version: 0,
    });
    mockSecureStore.getItemAsync.mockResolvedValue(persisted);

    const { useAuthStore } = await import("../auth-store");
    await waitForHydration(useAuthStore);

    expect(useAuthStore.getState().isAuth).toBe(true);
    expect(useAuthStore.getState().token).toBe("jwt-from-securestore");
  });

  it("leaves the store logged out when there is no persisted session (expired/cleared)", async () => {
    mockSecureStore.getItemAsync.mockResolvedValue(null);

    const { useAuthStore } = await import("../auth-store");
    await waitForHydration(useAuthStore);

    expect(useAuthStore.getState().isAuth).toBe(false);
    expect(useAuthStore.getState().token).toBe("");
  });

  it("leaves the store logged out when SecureStore returns an explicitly logged-out session", async () => {
    const persisted = JSON.stringify({
      state: { token: "", isAuth: false, profile: null, theme: "dark" },
      version: 0,
    });
    mockSecureStore.getItemAsync.mockResolvedValue(persisted);

    const { useAuthStore } = await import("../auth-store");
    await waitForHydration(useAuthStore);

    expect(useAuthStore.getState().isAuth).toBe(false);
    expect(useAuthStore.getState().token).toBe("");
  });
});
