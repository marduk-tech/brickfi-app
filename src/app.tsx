import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntApp, AppProps, ConfigProvider } from "antd";
import { FunctionComponent, useEffect } from "react";
import { queryClient } from "./libs/query-client";
import { Router } from "./routes/routes";
import { antTheme } from "./theme/ant-theme";
import "./theme/globals.scss";

export const App: FunctionComponent<AppProps> = () => {
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
          <Router />
        </AntApp>
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
