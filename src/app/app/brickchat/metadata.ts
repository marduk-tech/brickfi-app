import { Metadata } from "next";

// shared by /app/brickchat and /app/brickchat/[threadId]
const META_DESCR =
  "Talk to Brickfi to discover matching properties across Bangalore and get 360 assessment around builder, property, location and pricing..";
const META_TITLE = "Brickfi AI | Find the Home You Need Without Brokers or Spam";
export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCR,
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
    title: META_TITLE,
    description: META_DESCR,
    url: "https://brickfi.in",
    siteName: "Brickfi",
    images: [
      {
        url: "/images/brickfiai-preview.png",
        width: 1200,
        height: 630,
        alt: "Brickfi AI | Discover matching properties across Bangalore and get 360 assessment around builder, property, location and pricing.",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description: META_DESCR,
    images: ["/images/brickfiai-preview.png"],
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
