import { Metadata } from "next";
import BrickChatClient from "./brickchat/brickchat-client";

const META_DESCR =
  "Find the Perfect Home You Need Without Brokers or Spam.";
const META_TITLE = "Brickfi AI";
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
        alt: "Brickfi AI | Tell Brickfi what you're looking for. Discover matching properties across Bangalore.",
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

export default async function AppHomePage() {
  return <BrickChatClient />;
}
