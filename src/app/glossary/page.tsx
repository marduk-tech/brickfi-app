import { getQueryClient } from "@/libs/query-client";
import { getGlossaryQuery } from "@/queries/marketing";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import GlossaryClient from "./glossary-client";
import FourOFour from "@/custom-pages/landing/404";
import { SEO_CONTENT } from "@/libs/constants";

const META_DESCR =
  "Comprehensive glossary of real estate terms, definitions, and terminology to help you understand property investment and home buying processes.";
const META_TITLE = "Real Estate Glossary | Brickfi";
const META_URL = "https://brickfi.in/glossary";


export const metadata: Metadata = {
  title: META_TITLE,
  description:
    META_DESCR,
  keywords: [
    "real estate glossary",
    "property terms",
    "real estate definitions",
    "property terminology",
    "home buying terms",
    "brickfi",
  ],
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: META_URL,
      name: META_TITLE,
      description: META_DESCR,
      inLanguage: "en-IN",
      publisher: {
        "@type": "Organization",
        name: SEO_CONTENT.companyName,
        url: SEO_CONTENT.companyUrl,
        logo: {
          "@type": "ImageObject",
          url: SEO_CONTENT.companyLogo,
        },
      },
      about: {
        "@type": "Thing",
        name: "Real Estate Terminology",
        description:
          "Definitions and explanations of key property, investment, and regulatory terms for homebuyers in India.",
      },
    }),
  },
  openGraph: {
    title: META_TITLE,
    description:
      META_DESCR,
    type: "website",
    url: META_URL,
  },
  twitter: {
    card: "summary",
    title: META_TITLE,
    description: META_DESCR,
  },
  alternates: {
    canonical: META_URL,
  },
};

export default async function GlossaryPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getGlossaryQuery());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GlossaryClient />
    </HydrationBoundary>
  );
}
