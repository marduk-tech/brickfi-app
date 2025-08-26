"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntApp, ConfigProvider } from "antd";
import { useEffect } from "react";
import { queryClient } from "../libs/query-client";
import { antTheme } from "../theme/ant-theme";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({ style: Style.Default });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antTheme}>
        <AntApp style={{ maxWidth: 2000, margin: "auto" }}>
          {children}
        </AntApp>
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}