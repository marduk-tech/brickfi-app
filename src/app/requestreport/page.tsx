import { NewReportRequestForm } from "@/components/common/new-report-request-form";
import { Metadata } from "next";

const META_DESCR = "Get a comprehensive Brick360 Report around property layout, financial assessment, builder credibility and more for any property in Bangalore.";
const META_TITLE = "Brickfi | Get a 360 Report Card for any property in Bangalore";
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
    title: META_TITLE,
    description:
      META_DESCR,
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

export default function RequestReportPage() {
  return <NewReportRequestForm />;
}