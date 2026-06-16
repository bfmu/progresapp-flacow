import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { secureStorage, asyncStorage } from "../storage";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("secureStorage (expo-secure-store adapter)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getItem returns the stored value via SecureStore.getItemAsync", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("jwt-token-123");

    const value = await secureStorage.getItem("auth-store");

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("auth-store");
    expect(value).toBe("jwt-token-123");
  });

  it("getItem returns null when the key is not found", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const value = await secureStorage.getItem("missing-key");

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("missing-key");
    expect(value).toBeNull();
  });

  it("setItem stores the value via SecureStore.setItemAsync", async () => {
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

    await secureStorage.setItem("auth-store", "{\"token\":\"abc\"}");

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("auth-store", "{\"token\":\"abc\"}");
  });

  it("removeItem deletes the value via SecureStore.deleteItemAsync", async () => {
    (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

    await secureStorage.removeItem("auth-store");

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("auth-store");
  });
});

describe("asyncStorage (@react-native-async-storage/async-storage adapter)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getItem returns the stored value via AsyncStorage.getItem", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("{\"duration\":60}");

    const value = await asyncStorage.getItem("timer-store");

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("timer-store");
    expect(value).toBe("{\"duration\":60}");
  });

  it("getItem returns null when the key is not found", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const value = await asyncStorage.getItem("missing-key");

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("missing-key");
    expect(value).toBeNull();
  });

  it("setItem stores the value via AsyncStorage.setItem", async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await asyncStorage.setItem("timer-store", "{\"duration\":90}");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("timer-store", "{\"duration\":90}");
  });

  it("removeItem deletes the value via AsyncStorage.removeItem", async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    await asyncStorage.removeItem("timer-store");

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("timer-store");
  });
});
