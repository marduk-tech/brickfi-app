"use client";

import { App } from "@capacitor/app";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  APP_HOME,
  isNativeApp,
  openInAppBrowser,
  resolveAppLink,
} from "../libs/native-app";

// ClientProviders is mounted by both the root and /app layouts
let installed = false;

/**
 * Wires native app behaviour when running inside the Capacitor shell:
 *  - links leaving /app (or opening a new tab) go to the in-app browser
 *  - window.open is routed the same way
 *  - Android hardware back button navigates back, exits on the home screen
 * Renders nothing and is a no-op on the website.
 */
export function NativeAppBridge() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    if (installed || !isNativeApp()) return;
    installed = true;

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const action = resolveAppLink(
        anchor.getAttribute("href") || "",
        anchor.target === "_blank"
      );
      if (!action || action.type === "native") return;

      // Capture phase: runs before Next <Link> / React handlers
      event.preventDefault();
      event.stopPropagation();

      if (action.type === "in-app") {
        routerRef.current.push(action.path);
      } else {
        openInAppBrowser(action.url);
      }
    };

    const originalOpen = window.open.bind(window);
    window.open = (url?: string | URL, target?: string, features?: string) => {
      const action = url ? resolveAppLink(url.toString(), true) : null;

      if (action?.type === "in-app") {
        routerRef.current.push(action.path);
        return null;
      }
      if (action?.type === "browser") {
        openInAppBrowser(action.url);
        return null;
      }
      return originalOpen(url, target, features);
    };

    document.addEventListener("click", handleClick, true);

    const backButton = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack && window.location.pathname !== APP_HOME) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      installed = false;
      document.removeEventListener("click", handleClick, true);
      window.open = originalOpen;
      backButton.then((listener) => listener.remove());
    };
  }, []);

  return null;
}
