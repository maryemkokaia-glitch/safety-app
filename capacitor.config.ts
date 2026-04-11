import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ge.safetyapp.app",
  appName: "SafetyApp",
  webDir: ".next/static",
  server: {
    // Use local Next.js dev server during development
    url: "http://localhost:3000",
    cleartext: true,
  },
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "SafetyApp",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1e3a8a",
      showSpinner: false,
      launchAutoHide: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#1e40af",
    },
  },
};

export default config;
