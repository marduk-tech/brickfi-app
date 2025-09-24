import { getQueryClient } from "@/libs/query-client";
import {
  getDeveloper,
  getRealEstateDevelopersQuery,
} from "@/queries/real-estate-developer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import RealEstateDeveloperClient from "./real-estate-developer-client";

interface PageProps {
  params: Promise<{ developerId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { developerId } = await params;

  const developer = await getDeveloper(developerId);

  if (!developer) {
    return {
      title: "Developer Not Found | Brickfi",
      description: "The requested real estate developer could not be found.",
    };
  }

  const title = `${developer.name} - Real Estate Developer | Brickfi`;
  const description =
    developer.info?.oneLiner ||
    `Learn about ${developer.name}, a real estate developer. View their projects, management details, and financial information on Brickfi.`;

  return {
    title,
    description,
    keywords: [
      `${developer.name}`,
      "real estate developer",
      "bangalore",
      "property developer",
      "brickfi",
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://brickfi.in/app/real-estate-dev/${developerId}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: `https://brickfi.in/app/real-estate-dev/${developerId}`,
    },
  };
}

// main page
export default async function RealEstateDeveloperPage({ params }: PageProps) {
  const { developerId } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getRealEstateDevelopersQuery(developerId));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RealEstateDeveloperClient developerId={developerId} />
    </HydrationBoundary>
  );
}
