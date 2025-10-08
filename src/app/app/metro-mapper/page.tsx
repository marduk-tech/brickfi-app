import MetroMapperPage from "@/custom-pages/metro-mapper";
import { Metadata } from "next";

const META_DESCR = "Full map for Bangalore Namma Metro & Bangalore Suburban Rail project.";
const META_TITLE = "Brickfi | Bangalore Metro & Sub-Urban Rail Map";
export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCR,
  keywords: [
    "real estate",
    "bangalore",
    "brick360",
    "metro",
    "namma metro",
    "suburban rail",
    "brickfi",
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
    description:
      META_DESCR,
    url: "https://brickfi.in",
    siteName: "Brickfi",
    images: [
      {
        url: "/images/blr-metro-mapper.png",
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
    images: ["/images/blr-metro-mapper.png"],
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


export default function MetroMapperRoute() {
  return <MetroMapperPage />;
}