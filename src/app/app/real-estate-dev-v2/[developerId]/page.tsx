import { Metadata } from "next";
import { Suspense } from "react";
import { getDeveloperData } from "./actions/developer.action";
import { LoadingSkeleton } from "./components/loading-skeleton";
import RealEstateDeveloperClient from "./real-estate-developer-client";

interface PageProps {
  params: Promise<{ developerId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { developerId } = await params;
  const result = await getDeveloperData(developerId);

  if (!result.success || !result.data) {
    return {
      title: "Developer Not Found",
    };
  }

  return {
    title: `${result.data.name} - Real Estate Developer`,
    description:
      result.data.info?.oneLiner ||
      `Learn more about ${result.data.name} and their projects.`,
  };
}

export default async function RealEstateDeveloperPage({ params }: PageProps) {
  const { developerId } = await params;

  const developerPromise = getDeveloperData(developerId);

  return (
    <div>
      <Suspense fallback={<LoadingSkeleton />}>
        <DeveloperContent
          developerPromise={developerPromise}
          developerId={developerId}
        />
      </Suspense>
    </div>
  );
}

function DeveloperContent({
  developerPromise,
  developerId,
}: {
  developerPromise: Promise<any>;
  developerId: string;
}) {
  return (
    <RealEstateDeveloperClient
      developerPromise={developerPromise}
      developerId={developerId}
    />
  );
}
