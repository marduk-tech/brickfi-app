"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntApp, ConfigProvider } from "antd";
import { useEffect } from "react";
import { getQueryClient } from "../libs/query-client";
import { extractUtmParams, saveUtmToHistory } from "../libs/utm-utils";
import { antTheme } from "../theme/ant-theme";
import PosthogProvider from "./common/posthog-provider";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    const utmParams = extractUtmParams();
    if (utmParams) {
      saveUtmToHistory(utmParams);
    }
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NEXT_PUBLIC_DISABLE_SW !== "true"
    ) {
      const isDev = process.env.NODE_ENV === "development";

      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          if (isDev) {
            console.log(
              "🔧 [DEV MODE] Service Worker registered:",
              registration.scope
            );
            console.log(
              "💡 PWA features are active in development mode for testing"
            );
          } else {
            console.log("✅ Service Worker registered:", registration.scope);
          }

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  console.log("🔄 New service worker available");
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("❌ Service Worker registration failed:", error);
        });
    }
  }, []);

  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <PosthogProvider></PosthogProvider>
      <ConfigProvider theme={antTheme}>
        <AntApp style={{ maxWidth: 2000, margin: "auto" }}>{children}</AntApp>
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
