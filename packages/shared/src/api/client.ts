import axios, { type AxiosInstance } from "axios";

export type UnauthorizedReason = "token_missing" | "invalid_token" | "token_expired";

export type CreateApiClientOptions = {
  /** Base URL for all requests, e.g. `http://localhost:3000/api`. */
  baseURL: string;
  /** Returns the current JWT (or an empty string if there is none). */
  getToken: () => string;
  /**
   * Called when the API responds with 401. The `reason` mirrors the
   * backend's `error` field and lets the host app decide how to react
   * (clear session, navigate to login, etc.) without this package
   * depending on any DOM/browser/navigation APIs.
   */
  onUnauthorized: (reason: UnauthorizedReason) => void;
  /**
   * Optional hook called when the API responds with 403 (forbidden).
   * Lets the host app show a platform-appropriate message (e.g. a
   * snackbar on web, a toast on mobile).
   */
  onForbidden?: () => void;
  /** Request timeout in milliseconds. Defaults to 10000. */
  timeoutMs?: number;
};

const VALID_UNAUTHORIZED_REASONS: readonly UnauthorizedReason[] = [
  "token_missing",
  "invalid_token",
  "token_expired",
];

const resolveUnauthorizedReason = (errorCode: unknown): UnauthorizedReason => {
  if (
    typeof errorCode === "string" &&
    (VALID_UNAUTHORIZED_REASONS as readonly string[]).includes(errorCode)
  ) {
    return errorCode as UnauthorizedReason;
  }
  return "invalid_token";
};

/**
 * Creates a platform-agnostic axios instance with auth header injection
 * and centralized 401/403 handling. Contains no DOM/browser globals —
 * navigation and session-clearing side effects are delegated to the host
 * app via `onUnauthorized` / `onForbidden`.
 */
export const createApiClient = (opts: CreateApiClientOptions): AxiosInstance => {
  const { baseURL, getToken, onUnauthorized, onForbidden, timeoutMs = 10000 } = opts;

  const apiClient = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: {
      "Content-Type": "application/json",
    },
  });

  apiClient.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      const response = error?.response;

      if (response) {
        const { status, data } = response;

        if (status === 401) {
          onUnauthorized(resolveUnauthorizedReason(data?.error));
        }

        if (status === 403) {
          onForbidden?.();
        }
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};

/**
 * Singleton instance registered by the host app via `setApiClient`, used by
 * the default export below. `auth.ts`, `users.ts`, `exercises.ts`,
 * `lifting-histories.ts`, and `muscles.ts` all `import apiClient from
 * "./client"` and call `apiClient.get/post/...` directly, so the default
 * export must behave like an `AxiosInstance`, not the `createApiClient`
 * factory itself.
 */
let activeInstance: AxiosInstance | undefined;

/**
 * Registers the `AxiosInstance` returned by `createApiClient` as the
 * instance used by the default export's proxy. Call this once at app
 * bootstrap (e.g. `mobile/App.tsx`, `frontend/src/lib/axios.ts`) right
 * after `createApiClient(...)`.
 */
export const setApiClient = (instance: AxiosInstance): void => {
  activeInstance = instance;
};

const getActiveInstance = (): AxiosInstance => {
  if (!activeInstance) {
    throw new Error(
      "apiClient used before setApiClient was called. Call setApiClient(createApiClient({...})) at app bootstrap."
    );
  }
  return activeInstance;
};

/**
 * Lazily forwards every property access/call to the instance registered via
 * `setApiClient`, so `api/*.ts` modules can keep their existing
 * `import apiClient from "./client"; apiClient.get(...)` usage while the
 * concrete instance is created later (after `getToken`/`onUnauthorized`
 * callbacks are available) by the host app.
 */
const apiClientProxy = new Proxy({} as AxiosInstance, {
  get(_target, prop, receiver) {
    return Reflect.get(getActiveInstance(), prop, receiver);
  },
});

export default apiClientProxy;
