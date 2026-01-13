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

    const descriptions = [
      "View the Brickfi 360 Report to evaluate project performance, execution quality, and important checks before making a property investment.",
      "Check the Brickfi 360 Report for insights into completed developments, delivery credibility, and details that support better property decisions.",
       "See the Brickfi 360 Report to review project history, builder reputation, and essential factors buyers should know before investing.", 
       "Explore the Brickfi 360 Report to learn about project delivery, track record, and what matters most when choosing a property."
      ]
      const description = descriptions[Math.round(Math.random()*4)-1];
  return {
    title: `${result.data.name} - Real Estate Developer | Get a Brick360 Property Report with Brickfi`,
    description
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
