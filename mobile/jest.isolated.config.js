/**
 * Isolated ts-jest config for pure-logic unit tests in `mobile/`.
 *
 * Background: the standard `jest-expo` preset currently fails to resolve
 * `react-native/jest-preset` due to duplicate/non-deduped `react-native`
 * copies pulled in transitively by `@expo/vector-icons` / `nativewind`
 * (see Phase 4 "Known Issues" in sdd/mobile-app/tasks). This config
 * bypasses the RN preset entirely for files that have no RN runtime
 * dependency (pure functions, validation, error-mapping, etc.).
 *
 * Usage:
 *   npx jest -c jest.isolated.config.js <path-to-test>
 *
 * Do NOT use this config for component/integration tests that render
 * React Native components — those need the `jest-expo` preset once the
 * dedup issue is resolved.
 *
 * `moduleNameMapper` mirrors the `@progresapp/shared/*` subpath mapping from
 * `tsconfig.json` (`paths`), which ts-jest does not apply on its own —
 * needed by tests that import `createAuthStore` from
 * `@progresapp/shared/store/auth` (e.g. `auth-store.test.ts`).
 */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          module: "commonjs",
          target: "es2020",
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@progresapp/shared/(.*)$": "<rootDir>/../packages/shared/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/src/lib/__tests__/storage.test.ts"],
};
