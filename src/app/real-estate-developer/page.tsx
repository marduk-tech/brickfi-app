import { SEO_CONTENT } from "@/libs/constants";
import { getQueryClient } from "@/libs/query-client";
import { getAllDevelopersQuery } from "@/queries/real-estate-developer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import DevelopersClient from "./developers-client";

const META_TITLE = "Real Estate Developers | Brickfi";
const META_DESCR =
  "Browse all real estate developers listed on Brickfi. Explore developer profiles, track records, and project portfolios to make informed property decisions.";
const META_URL = "https://brickfi.in/real-estate-developer";

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCR,
  keywords: [
    "real estate developers",
    "property developers",
    "builder profiles",
    "developer track record",
    "real estate builders india",
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
        name: "Real Estate Developers",
        description:
          "Profiles and portfolios of real estate developers and builders in India.",
      },
    }),
  },
  openGraph: {
    title: META_TITLE,
    description: META_DESCR,
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

export default async function RealEstateDevelopersPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getAllDevelopersQuery());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DevelopersClient />
    </HydrationBoundary>
  );
}
