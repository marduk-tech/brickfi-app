import ReportLanding from "@/custom-pages/landing/report-landing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brickfi | Get a 360 Report Card across any property in Bangalore",
  description:
    "Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
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
    title: "Brickfi | Get a 360 Report Card across any property in Bangalore",
    description:
      "Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
    url: "https://brickfi.in",
    siteName: "Brickfi",
    images: [
      {
        url: "/images/brick360-preview.png",
        width: 1200,
        height: 630,
        alt: "Brickfi | Get a 360 Report Card across any property in Bangalore",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brickfi | Get a 360 Report Card across any property in Bangalore",
    description:
      "Get a comprehensive Brick360 report around property, investment, builder and more for any property in Bangalore.",
    images: ["/images/brick360-preview.png"],
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

export default function ReportLandingPage() {
  return <ReportLanding />;
}