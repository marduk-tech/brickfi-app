import { getQueryClient } from "@/libs/query-client";
import { getGlossaryQuery } from "@/queries/marketing";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import GlossaryClient from "./glossary-client";
import FourOFour from "@/custom-pages/landing/404";

export const metadata: Metadata = {
  title: "Real Estate Glossary | Brickfi",
  description: "Comprehensive glossary of real estate terms, definitions, and terminology to help you understand property investment and home buying processes.",
  keywords: [
    "real estate glossary",
    "property terms",
    "real estate definitions",
    "property terminology",
    "home buying terms",
    "brickfi",
  ],
  openGraph: {
    title: "Real Estate Glossary | Brickfi",
    description: "Comprehensive glossary of real estate terms, definitions, and terminology to help you understand property investment and home buying processes.",
    type: "website",
    url: "https://brickfi.in/glossary",
  },
  twitter: {
    card: "summary",
    title: "Real Estate Glossary | Brickfi",
    description: "Comprehensive glossary of real estate terms, definitions, and terminology to help you understand property investment and home buying processes.",
  },
  alternates: {
    canonical: "https://brickfi.in/glossary",
  },
};

export default async function GlossaryPage() {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getGlossaryQuery());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* <GlossaryClient /> */}
       <FourOFour></FourOFour>
    </HydrationBoundary>
   
  );
}