/**
 * Expo app config (dynamic, not static app.json) so we can read
 * EXPO_PUBLIC_API_BASE_URL from the environment at build time.
 *
 * - Local dev (simulator/Expo Go): falls back to localhost.
 * - Preview/production: EXPO_PUBLIC_API_BASE_URL is supplied via the
 *   matching `env` block in eas.json.
 */
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: "progresapp-mobile",
  slug: "progresapp-mobile",
  version: "0.0.1",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  scheme: "progresapp",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0f172a",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.progresapp.mobile",
  },
  android: {
    package: "com.progresapp.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0f172a",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-secure-store"],
  extra: {
    apiBaseUrl: API_BASE_URL,
  },
};
