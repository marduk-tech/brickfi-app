import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import { safeNavigator, safeWindow } from "./browser-utils";

/**
 * Native app (Capacitor Android shell) helpers.
 *
 * The shell appends APP_USER_AGENT to the WebView user agent (see
 * capacitor.config.ts); src/middleware.ts uses the same marker server side.
 */
export const APP_USER_AGENT = "BrickfiApp";
export const APP_HOME = "/app";

/** True when running inside the Brickfi native app */
export const isNativeApp = (ua = safeNavigator.userAgent): boolean =>
  ua.includes(APP_USER_AGENT) || Capacitor.isNativePlatform();

const isAppPath = (pathname: string) =>
  pathname === APP_HOME || pathname.startsWith(`${APP_HOME}/`);

export type LinkAction =
  | { type: "native" } // tel:, mailto:, intents etc. - let the OS handle it
  | { type: "in-app"; path: string } // stays inside the app WebView
  | { type: "browser"; url: string }; // opens in the in-app browser (Custom Tab)

/**
 * Decide how a link should be opened inside the native app.
 * @param href Link target (absolute or relative)
 * @param newTab Whether the link asked for a new tab/window
 */
export function resolveAppLink(href: string, newTab: boolean): LinkAction | null {
  let url: URL;
  try {
    url = new URL(href, safeWindow.location.href);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { type: "native" };
  }

  if (url.origin === safeWindow.location.origin && isAppPath(url.pathname)) {
    // New tabs don't exist in the app, so open /app links in place
    return newTab ? { type: "in-app", path: url.pathname + url.search + url.hash } : null;
  }

  return { type: "browser", url: url.toString() };
}

/** Open a URL in the in-app browser (Chrome Custom Tab on Android) */
export async function openInAppBrowser(url: string) {
  try {
    await Browser.open({ url, toolbarColor: "#2E3E4E" });
  } catch (error) {
    console.error("Failed to open in-app browser:", error);
  }
}
