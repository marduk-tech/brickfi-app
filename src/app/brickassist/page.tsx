import BrickAssistLanding from "@/custom-pages/landing/brick-assist-landing";
import { Metadata } from "next";



const META_DESCR = "Consult with Brickfi to get an expert advice on your next home purchase. We provide unbiased, data backed and technology driven real estate advisory.";
const META_TITLE = "Brickfi | Unbiased & Data-Backed Home Buying Advise.";
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
        url: "/images/brickassist-preview.png",
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
    images: ["/images/brickassist-preview.png"],
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

export default function BrickAssistPage() {
  return <BrickAssistLanding />;
}