/**
 * Persist keys used by the shared Zustand stores. Centralized here so both
 * the auth and timer stores (and any platform-specific storage adapters
 * that need to read these keys directly) stay in sync.
 */
export const PERSIST_KEYS = {
  auth: "auth-store",
  timer: "timer-store",
} as const;
