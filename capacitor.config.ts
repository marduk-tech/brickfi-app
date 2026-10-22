/// <reference types="node" />
// Excluded from tsconfig.json (Next build), so Node types are referenced here
import type { CapacitorConfig } from "@capacitor/cli";

// The app is SSR/dynamic (Next server, middleware, dynamic routes), so the native
// shell loads the hosted site instead of a static export. src/middleware.ts keeps
// the WebView confined to /app based on the appended user agent below.
const APP_URL = process.env.CAP_SERVER_URL || "https://app-staging.brickfi.in";

// TODO(placeholder): brand colours for status bar / splash
const BRAND_COLOR = "#38b6ff";
const SPLASH_BACKGROUND = "#FFFFFF";

const config: CapacitorConfig = {
  appId: "in.brickfi.app",
  appName: "Brickfi",
  // Local shell assets only (offline/error page); the app itself is remote
  webDir: "native-shell",
  appendUserAgent: "BrickfiApp",
  server: {
    url: `${APP_URL}/app`,
    cleartext: false,
    // Hosts allowed to load inside the WebView; anything else opens externally
    allowNavigation: ["brickfi.in", "*.brickfi.in"],
    // Shown when the hosted app can't be reached (no network, server down)
    errorPath: "offline.html",
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: SPLASH_BACKGROUND,
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: "DARK", // light text, for a dark background
      backgroundColor: BRAND_COLOR,
    },
  },
};

export default config;
