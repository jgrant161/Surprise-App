import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Snap Schedule native shell.
 *
 * The app is a thin native wrapper around the hosted web app. `server.url` makes the
 * WebView load the live site instead of a bundled copy, so every web deploy reaches
 * phones instantly with no store review. `www/` only holds the offline fallback page.
 *
 * Point the shell at staging with:  SNAP_SCHEDULE_URL=https://staging.snapschedule.app npx cap sync
 */
const serverUrl = process.env.SNAP_SCHEDULE_URL ?? "https://snapschedule.app";

const config: CapacitorConfig = {
  // Change before the first store submission if you want a different reverse-domain id.
  appId: "app.snapschedule.mobile",
  appName: "Snap Schedule",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: false,
    // Pages outside this host open in the system browser (Google Calendar links etc.).
    allowNavigation: [new URL(serverUrl).hostname],
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#4F46E5",
    preferredContentMode: "mobile",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#4F46E5",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: "#4F46E5",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#4F46E5",
      overlaysWebView: false,
    },
  },
};

export default config;
