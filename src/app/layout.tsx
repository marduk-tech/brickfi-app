import PosthogProvider from "@/components/common/posthog-provider";
import type { Metadata } from "next";
import Script from "next/script";
import AntdRegistry from "../components/antd-registry";
import { ClientProviders } from "../components/client-providers";
import "../theme/globals.scss";
import { SEO_CONTENT } from "@/libs/constants";

// Google tags - each one is left out when its id is unset
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID; // G-...
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID; // GTM-...
// Google Ads tag (AW-...) - loaded through the same gtag as analytics
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
// gtag.js loads with whichever of the two is set
const GTAG_ID = GA_MEASUREMENT_ID || GOOGLE_ADS_ID;
// Meta Pixel - not loaded at all when unset
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.brickfi.in"),
  title: {
    default: "Brickfi | The Smartest Way to Buy your Next Property",
    template: "%s",
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
    canonical: "https://www.brickfi.in/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.brickfi.in",
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

const RootSEOSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: SEO_CONTENT.companyName,
      url: SEO_CONTENT.companyUrl,
      logo: SEO_CONTENT.companyLogo,
      sameAs: [
        "https://www.linkedin.com/company/brickfi",
        "https://www.instagram.com/brickfi",
      ],
      description: SEO_CONTENT.companyDescription,
      foundingDate: "2025",
      location: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressCountry: "IN",
        },
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "BrickFi Platform",
      url: SEO_CONTENT.companyUrl,
      applicationCategory: "RealEstateListing",
      operatingSystem: "Web",
      description: SEO_CONTENT.companyDescription,
      creator: {
        "@type": "Organization",
        name: SEO_CONTENT.companyName,
        url: SEO_CONTENT.companyUrl,
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(RootSEOSchema) }}
        />
        {/* Google consent mode - before any Google tag loads. Ad storage is
            denied until the visitor accepts the consent banner (see
            setAdConsent in libs/ad-attribution.ts), whose answer is kept in
            the bf_consent_ads cookie and restored here on later visits. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              var bfAds = /(?:^|; )bf_consent_ads=1/.test(document.cookie) ? 'granted' : 'denied';
              gtag('consent', 'default', {
                ad_storage: bfAds,
                ad_user_data: bfAds,
                ad_personalization: bfAds,
                analytics_storage: 'granted'
              });
            `,
          }}
        />

        {GTAG_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
              gtag('js', new Date());
              ${
                GA_MEASUREMENT_ID
                  ? `gtag('config', '${GA_MEASUREMENT_ID}');`
                  : ""
              }
              ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ""}
            `,
              }}
            />
          </>
        )}
        {GTM_ID && (
          <Script
            id="google-tag-mgr"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
            `,
            }}
          />
        )}
        {META_PIXEL_ID && (
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
fbq('consent', /(?:^|; )bf_consent_ads=1/.test(document.cookie) ? 'grant' : 'revoke');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
            `,
            }}
          ></Script>
        )}
      </head>
      <body>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
        )}
        {META_PIXEL_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none", visibility: "hidden" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}

        <AntdRegistry>
          <ClientProviders>{children}</ClientProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
