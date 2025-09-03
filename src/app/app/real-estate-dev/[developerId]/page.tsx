import { axiosApiInstance } from "@/libs/axios-api-Instance";
import { RealEstateDeveloper } from "@/types/RealEstateDeveloper";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import RealEstateDeveloperClient from "./real-estate-developer-client";

interface PageProps {
  params: Promise<{ developerId: string }>;
}

async function getRealEstateDeveloper(
  id: string
): Promise<RealEstateDeveloper | null> {
  try {
    const { data } = await axiosApiInstance.get(`/real-estate-developer/${id}`);
    return data as RealEstateDeveloper;
  } catch (error) {
    console.error("Failed to fetch real estate developer:", error);
    return null;
  }
}

// dynamic metadata
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { developerId } = await params;
  const developer = await getRealEstateDeveloper(developerId);

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

  const realEstateDeveloper = await getRealEstateDeveloper(developerId);

  if (!realEstateDeveloper) {
    notFound();
  }

  return <RealEstateDeveloperClient developer={realEstateDeveloper} />;
}
