import type { CapacitorConfig } from "@capacitor/cli";
// The native shells load the live Kraud deployment (same build as the PWA) — set KRAUD_APP_URL before `npx cap sync`.
const url = process.env.KRAUD_APP_URL || "https://kraud.example.com";
const config: CapacitorConfig = {
  appId: "ng.kraud.app",
  appName: "Kraud",
  webDir: "www",
  server: { url, cleartext: url.startsWith("http://"), allowNavigation: ["*.monnify.com"] },
  backgroundColor: "#002454",
  android: { backgroundColor: "#002454" },
  ios: { backgroundColor: "#002454", contentInset: "always" },
  plugins: { SplashScreen: { launchShowDuration: 800, backgroundColor: "#002454", showSpinner: false }, StatusBar: { style: "DARK", backgroundColor: "#002454" } },
};
export default config;
