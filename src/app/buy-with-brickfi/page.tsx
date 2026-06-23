import MainLanding from "@/custom-pages/landing/main-landing";
import type { Metadata } from "next";
import { headers } from "next/headers";

const META_DESCR = "The stress-free way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.";
const META_TITLE = "Brickfi | Stress Free Home Buying Experience";
export const metadata: Metadata = {
  title: META_TITLE,
  description:
    META_DESCR,
  keywords: [
    "real estate",
    "property",
    "bangalore",
    "investment",
    "brick360",
    "brickfi",
    "home buying",
    "property analysis",
  ],
  authors: [{ name: "Brickfi" }],
  creator: "Brickfi",
  publisher: "Brickfi",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://www.brickfi.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: META_TITLE,
    description:
      META_DESCR,
    url: "https://www.brickfi.in",
    siteName: "Brickfi",
    images: [
      {
        url: "/images/brickfi-preview.png",
        width: 1200,
        height: 630,
        alt: META_TITLE,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description:
      META_DESCR,
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
};

export default async function Home() {
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const isMobileSSR = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  return <MainLanding initialIsMobile={isMobileSSR} />;
}
