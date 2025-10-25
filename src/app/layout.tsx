import PosthogProvider from "@/components/common/posthog-provider";
import type { Metadata } from "next";
import Script from "next/script";
import AntdRegistry from "../components/antd-registry";
import { ClientProviders } from "../components/client-providers";
import "../theme/globals.scss";

export const metadata: Metadata = {
  // metadataBase: new URL("https://brickfi.in"),
  title: {
    default: "Brickfi | The Smartest Way to Buy your Next Property",
    template: "%s | Brickfi",
  },
  description:
    "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
  keywords: [
    "real estate",
    "property",
    "bangalore",
    "investment",
    "brick360",
    "brickfi",
  ],
  authors: [{ name: "Brickfi" }],
  creator: "Brickfi",
  publisher: "Brickfi",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://brickfi.in/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://brickfi.in",
    siteName: "Brickfi",
    title: "The Smartest Way to Buy your Next Property",
    description:
      "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
    images: [
      {
        url: "/images/brickfi-preview.png",
        width: 1200,
        height: 630,
        alt: "Brickfi - The Smartest Way to Buy your Next Property",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Smartest Way to Buy your Next Property",
    description:
      "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
    images: ["/images/brickfi-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#2E3E4E" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Brickfi" />
        <link rel="apple-touch-icon" href="/images/logos/apple-icon-180.png" />

        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-Q2HFD85Y22"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-Q2HFD85Y22');
            `,
          }}
        />
        <Script
          id="google-tag-mgr"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KTQL7X5S');
            `,
          }}
        />
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '787676156936614');
fbq('track', 'PageView');
            `,
          }}
        ></Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KTQL7X5S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none", visibility: "hidden" }}
            src="https://www.facebook.com/tr?id=787676156936614&ev=PageView&noscript=1"
          />
        </noscript>

        <AntdRegistry>
          <ClientProviders>{children}</ClientProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
