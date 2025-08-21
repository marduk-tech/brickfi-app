"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntApp, ConfigProvider } from "antd";
import { useEffect } from "react";
import { queryClient } from "../libs/query-client";
import { antTheme } from "../theme/ant-theme";
import "../theme/globals.scss";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false });
      StatusBar.setStyle({ style: Style.Default });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://brickfi.in/" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Brickfi | The Smartest Way to Buy your Next Property</title>
        <meta
          name="description"
          content="The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore."
        />
        <meta property="og:site_name" content="Brickfi" />
        <meta
          property="og:title"
          content="The Smartest Way to Buy your Next Property"
        />
        <meta
          property="og:description"
          content="The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore."
        />
        <meta
          property="og:image"
          content="https://brickfi.in/images/brickfi-preview.png"
        />
        <meta property="og:type" content="website" />
        <meta
          name="twitter:description"
          content="The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore."
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider theme={antTheme}>
            <AntApp style={{ maxWidth: 2000, margin: "auto" }}>
              {children}
            </AntApp>
          </ConfigProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </body>
    </html>
  );
}
