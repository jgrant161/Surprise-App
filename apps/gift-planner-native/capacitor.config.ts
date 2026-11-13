import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Surprise Stash native shell for the gift planner web app (`apps/gift-planner`).
 *
 * The app is a thin native wrapper around the hosted web app. `server.url` makes the
 * WebView load the live site instead of a bundled copy, so every web deploy reaches
 * phones instantly with no store review. `www/` only holds the offline fallback page.
 *
 * Point the shell at staging with:  SURPRISE_STASH_URL=https://staging.surprisestash.app npx cap sync
 */
const serverUrl = process.env.SURPRISE_STASH_URL ?? "https://surprisestash.app";

const BRAND = "#db2777";

const config: CapacitorConfig = {
  // Change before the first store submission if you want a different reverse-domain id;
  // it cannot change after the first upload.
  appId: "app.surprisestash.mobile",
  appName: "Surprise Stash",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: false,
    // Pages outside this host open in the system browser (shopping links via /go/<id>).
    allowNavigation: [new URL(serverUrl).hostname],
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: BRAND,
    preferredContentMode: "mobile",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: BRAND,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: BRAND,
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: BRAND,
      overlaysWebView: false,
    },
  },
};

export default config;
