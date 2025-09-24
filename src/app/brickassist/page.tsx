import BrickAssistLanding from "@/custom-pages/landing/brick-assist-landing";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Brickfi | Explore unbiased and data backed home buying advise.",
  description:
    "Consult with Brickfi to get an expert advice on your next home purchase. We provide unbiased, data backed and technology driven real estate advisory.",
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
    title: "Brickfi | Explore unbiased and data backed home buying advise.",
    description:
      "Consult with Brickfi to get an expert advice on your next home purchase. We provide unbiased, data backed and technology driven real estate advisory.",
    url: "https://brickfi.in",
    siteName: "Brickfi",
    images: [
      {
        url: "/images/brickassist-preview.png",
        width: 1200,
        height: 630,
        alt: "Brickfi | Explore unbiased and data backed home buying advise.",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brickfi | Explore unbiased and data backed home buying advise.",
    description:
      "Consult with Brickfi to get an expert advice on your next home purchase. We provide unbiased, data backed and technology driven real estate advisory.",
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