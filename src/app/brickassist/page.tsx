import BrickAssistLanding from "@/custom-pages/landing/brick-assist-landing";
import BrickAssistLandingV2 from "@/custom-pages/landing/brick-assist-landing-v2";
import { SEO_CONTENT } from "@/libs/constants";
import { Metadata } from "next";
import { headers } from "next/headers";

const META_DESCR =
  "Consult with Brickfi to get an expert advice on your next home purchase. We provide unbiased, data backed and technology driven real estate advisory.";
const META_TITLE = "Brickfi | Unbiased & Data-Backed Home Buying Advise.";
const META_URL = "https://www.brickfi.in/brickassist";

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
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: META_URL,
      name: META_TITLE,
      description: META_DESCR,
      publisher: {
        "@type": "Organization",
        name: SEO_CONTENT.companyName,
        url: SEO_CONTENT.companyUrl,
        logo: {
          "@type": "ImageObject",
          url: SEO_CONTENT.companyLogo,
        },
      },
      inLanguage: "en-IN",
    }),
  },
  authors: [{ name: "Brickfi" }],
  creator: "Brickfi",
  publisher: "Brickfi",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(META_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: META_TITLE,
    description: META_DESCR,
    url: META_URL,
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
    description: META_DESCR,
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

export default async function BrickAssistPage() {
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const isMobileSSR = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  return <BrickAssistLandingV2 initialIsMobile={isMobileSSR} />;
}
