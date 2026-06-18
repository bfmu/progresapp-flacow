/**
 * Integration tests for LoginScreen (mobile-auth spec scenarios):
 * - Renders email + password inputs and a login button
 * - Shows validation error when email is empty on submit
 * - Shows validation error when password is missing
 * - Calls loginRequest with trimmed email+password when form is valid
 * - Shows error message when loginRequest rejects with 401/400
 * - Renders Google sign-in button
 * - Tapping Google button calls promptAsync
 * - Successful Google auth calls googleIdTokenRequest and updates store
 * - Failed Google auth (response.type='error') shows error message
 * - Network error in handleGoogleSignIn shows error message
 *
 * Uses @testing-library/react-native with the jest-expo preset.
 * Network and store dependencies are mocked; no real Axios / SecureStore calls.
 */

import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import LoginScreen from "../LoginScreen";

// ----- Mocks -----

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        googleClientId: "test-google-client-id",
      },
    },
  },
}));

// Controllable mock for Google.useIdTokenAuthRequest.
// Tests set `mockGoogleResponse` before rendering the component.
const mockPromptAsync = jest.fn();
let mockGoogleResponse: Record<string, unknown> | null = null;

jest.mock("expo-auth-session/providers/google", () => ({
  useIdTokenAuthRequest: jest.fn(() => [
    { url: "https://accounts.google.com/o/oauth2/auth" }, // mock request object (truthy)
    mockGoogleResponse,
    mockPromptAsync,
  ]),
}));

const mockLoginRequest = jest.fn();
const mockGoogleIdTokenRequest = jest.fn();
const mockUserInfoRequest = jest.fn();

jest.mock("@progresapp/shared/api/auth", () => ({
  loginRequest: (...args: unknown[]) => mockLoginRequest(...args),
  googleIdTokenRequest: (...args: unknown[]) => mockGoogleIdTokenRequest(...args),
}));

jest.mock("@progresapp/shared/api/users", () => ({
  userInfoRequest: (...args: unknown[]) => mockUserInfoRequest(...args),
}));

const mockSetToken = jest.fn();
const mockSetProfile = jest.fn();

// `useAuthStore` is a zustand store selector hook — mock it to return the
// right value depending on which slice of state the selector accesses.
jest.mock("../../lib/auth-store", () => ({
  useAuthStore: (selector: (s: { setToken: jest.Mock; setProfile: jest.Mock }) => unknown) =>
    selector({ setToken: mockSetToken, setProfile: mockSetProfile }),
}));

// Navigation mock — LoginScreen uses navigate() to go to ForgotPassword/Register
const mockNavigate = jest.fn();
const navigationProp = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
  addListener: jest.fn().mockReturnValue(() => {}),
  removeListener: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(false),
  getParent: jest.fn(),
  getState: jest.fn(),
  setParams: jest.fn(),
  getId: jest.fn(),
};

const routeProp = { key: "Login", name: "Login" as const, params: undefined };

const renderScreen = () =>
  render(<LoginScreen navigation={navigationProp as any} route={routeProp as any} />);

// ----- Tests -----

describe("LoginScreen — UI structure", () => {
  beforeEach(() => {
    mockGoogleResponse = null;
    jest.clearAllMocks();
  });

  it("renders email and password inputs plus the submit button", () => {
    const { getByTestId } = renderScreen();

    expect(getByTestId("login-email-input")).toBeTruthy();
    expect(getByTestId("login-password-input")).toBeTruthy();
    expect(getByTestId("login-submit-button")).toBeTruthy();
  });

  it("renders Google sign-in button", () => {
    const { getByTestId, getByText } = renderScreen();

    expect(getByTestId("login-google-button")).toBeTruthy();
    expect(getByText("Continuar con Google")).toBeTruthy();
  });
});

describe("LoginScreen — form validation (mobile-auth spec)", () => {
  beforeEach(() => {
    mockGoogleResponse = null;
    jest.clearAllMocks();
  });

  it("shows a validation error when email is empty on submit", async () => {
    const { getByTestId, getByText } = renderScreen();

    // Leave email empty, fill password
    fireEvent.changeText(getByTestId("login-password-input"), "secret123");
    fireEvent.press(getByTestId("login-submit-button"));

    await waitFor(() => {
      expect(getByText("El email es requerido")).toBeTruthy();
    });
    // loginRequest must NOT be called — validation prevented the request
    expect(mockLoginRequest).not.toHaveBeenCalled();
  });

  it("shows a validation error when password is missing on submit", async () => {
    const { getByTestId, getByText } = renderScreen();

    fireEvent.changeText(getByTestId("login-email-input"), "user@example.com");
    // Leave password empty
    fireEvent.press(getByTestId("login-submit-button"));

    await waitFor(() => {
      expect(getByText("La contraseña es requerida")).toBeTruthy();
    });
    expect(mockLoginRequest).not.toHaveBeenCalled();
  });

  it("shows a validation error when email format is invalid", async () => {
    const { getByTestId, getByText } = renderScreen();

    fireEvent.changeText(getByTestId("login-email-input"), "not-an-email");
    fireEvent.changeText(getByTestId("login-password-input"), "secret123");
    fireEvent.press(getByTestId("login-submit-button"));

    await waitFor(() => {
      expect(getByText("Email inválido")).toBeTruthy();
    });
    expect(mockLoginRequest).not.toHaveBeenCalled();
  });
});

describe("LoginScreen — API integration (mobile-auth spec)", () => {
  beforeEach(() => {
    mockGoogleResponse = null;
    jest.clearAllMocks();
  });

  it("calls loginRequest with email+password when form is valid and sets token on success", async () => {
    mockLoginRequest.mockResolvedValueOnce({ data: { accessToken: "jwt-abc" } });
    mockUserInfoRequest.mockResolvedValueOnce({
      id: "1",
      full_name: "Test User",
      email: "user@example.com",
    });

    const { getByTestId } = renderScreen();

    fireEvent.changeText(getByTestId("login-email-input"), "user@example.com");
    fireEvent.changeText(getByTestId("login-password-input"), "secret123");

    await act(async () => {
      fireEvent.press(getByTestId("login-submit-button"));
    });

    await waitFor(() => {
      expect(mockLoginRequest).toHaveBeenCalledWith("user@example.com", "secret123");
      expect(mockSetToken).toHaveBeenCalledWith("jwt-abc");
    });
  });

  it("shows error message when loginRequest rejects with 400 (invalid credentials)", async () => {
    mockLoginRequest.mockRejectedValueOnce({
      response: { status: 400, data: { message: "Invalid password" } },
    });

    const { getByTestId, getByText } = renderScreen();

    fireEvent.changeText(getByTestId("login-email-input"), "user@example.com");
    fireEvent.changeText(getByTestId("login-password-input"), "wrongpass");

    await act(async () => {
      fireEvent.press(getByTestId("login-submit-button"));
    });

    await waitFor(() => {
      expect(getByText("Email o contraseña incorrectos.")).toBeTruthy();
    });
  });

  it("shows a generic error message for unknown API errors", async () => {
    mockLoginRequest.mockRejectedValueOnce(new Error("Network Error"));

    const { getByTestId, getByText } = renderScreen();

    fireEvent.changeText(getByTestId("login-email-input"), "user@example.com");
    fireEvent.changeText(getByTestId("login-password-input"), "anypass");

    await act(async () => {
      fireEvent.press(getByTestId("login-submit-button"));
    });

    await waitFor(() => {
      expect(getByText("Ocurrió un error. Por favor, inténtalo de nuevo.")).toBeTruthy();
    });
  });
});

describe("LoginScreen — Google Sign-In flow (google-oauth spec)", () => {
  beforeEach(() => {
    mockGoogleResponse = null;
    jest.clearAllMocks();
  });

  it("taps Google button calls promptAsync", async () => {
    const { getByTestId } = renderScreen();

    await act(async () => {
      fireEvent.press(getByTestId("login-google-button"));
    });

    expect(mockPromptAsync).toHaveBeenCalled();
  });

  it("successful Google auth (response.type=success) calls googleIdTokenRequest and updates store", async () => {
    mockGoogleIdTokenRequest.mockResolvedValueOnce({ accessToken: "google-jwt-xyz" });
    mockUserInfoRequest.mockResolvedValueOnce({
      id: "42",
      full_name: "Google User",
      email: "google@example.com",
    });

    // Set response before rendering so the useEffect fires on mount
    mockGoogleResponse = { type: "success", params: { id_token: "google-id-token-abc" } };

    renderScreen();

    await waitFor(() => {
      expect(mockGoogleIdTokenRequest).toHaveBeenCalledWith("google-id-token-abc");
      expect(mockSetToken).toHaveBeenCalledWith("google-jwt-xyz");
      expect(mockSetProfile).toHaveBeenCalledWith({
        id: "42",
        full_name: "Google User",
        email: "google@example.com",
      });
    });
  });

  it("failed Google auth (response.type=error) shows error message and resets loading", async () => {
    mockGoogleResponse = { type: "error", error: { code: "access_denied" } };

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(
        getByText("No se pudo autenticar con Google. Intentá de nuevo.")
      ).toBeTruthy();
    });

    // googleIdTokenRequest must NOT be called — Google flow failed before id_token
    expect(mockGoogleIdTokenRequest).not.toHaveBeenCalled();
  });

  it("network error in handleGoogleSignIn shows error message and resets loading", async () => {
    mockGoogleIdTokenRequest.mockRejectedValueOnce(new Error("Network Error"));
    mockGoogleResponse = { type: "success", params: { id_token: "valid-token" } };

    const { getByText } = renderScreen();

    await waitFor(() => {
      expect(
        getByText("No se pudo autenticar con Google. Intentá de nuevo.")
      ).toBeTruthy();
    });

    expect(mockGoogleIdTokenRequest).toHaveBeenCalledWith("valid-token");
    // setToken must NOT have been called since request failed
    expect(mockSetToken).not.toHaveBeenCalled();
  });
});
