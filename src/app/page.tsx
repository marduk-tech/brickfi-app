import MainLanding from "@/pages/landing/main-landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brickfi | The Smartest Way to Buy your Next Property",
  description:
    "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
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
  metadataBase: new URL("https://brickfi.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Smartest Way to Buy your Next Property",
    description:
      "The smartest way to buy real estate. Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
    url: "https://brickfi.in",
    siteName: "Brickfi",
    images: [
      {
        url: "/images/brickfi-preview.png",
        width: 1200,
        height: 630,
        alt: "Brickfi - The Smartest Way to Buy your Next Property",
      },
    ],
    locale: "en_IN",
    type: "website",
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
};

export default function Home() {
  return <MainLanding />;
}
