import { getQueryClient } from "@/libs/query-client";
import {
  getDeveloperBySlug,
  getRealEstateDeveloperBySlugQuery,
} from "@/queries/real-estate-developer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import RealEstateDeveloperClient from "./real-estate-developer-client";
import FourOFour from "@/custom-pages/landing/404";
import { SEO_CONTENT } from "@/libs/constants";

interface PageProps {
  params: Promise<{ developerId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { developerId: slug } = await params;

  try {
    const developer = await getDeveloperBySlug(slug, false);

    if (!developer || !developer.name) {
      return {
        title: "Real Estate Developer Not Found | Brickfi",
        description: "The requested real estate developer could not be found.",
      };
    }
    
    const descriptions = [
      "View the Brickfi 360 Report to evaluate project performance, execution quality, and important checks before making a property investment.",
      "Check the Brickfi 360 Report for insights into completed developments, delivery credibility, and details that support better property decisions.",
       "See the Brickfi 360 Report to review project history, builder reputation, and essential factors buyers should know before investing.", 
       "Explore the Brickfi 360 Report to learn about project delivery, track record, and what matters most when choosing a property."
      ]
      const description = descriptions[Math.round(Math.random()*4)-1];

    const title = `${developer.name} | Brickfi 360 Report for Smarter Property Decisions`;
    // const description =
    //   developer.info?.oneLiner ||
    //   `Learn about ${developer.name}, a real estate developer. View their projects, management details, and financial information on Brickfi.`;

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
      other: {
        "application/ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              url: `https://www.brickfi.in/real-estate-developer/${slug}`,
              name: title,
              description,
              publisher: {
                "@type": "Organization",
                name: "BrickFi",
                url: SEO_CONTENT.companyUrl,
                logo: {
                  "@type": "ImageObject",
                  url: SEO_CONTENT.companyLogo,
                },
              },
              inLanguage: "en-IN",
            },
            {
              "@type": "FAQPage",
              mainEntity: developer.info && developer.info.faq ? developer.info.faq.map((q: any) => {
                return {
                  "@type": "Question",
                  name: q.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: q.answer,
                  },
                }
              }): [],
            },
          ],
        }),
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://www.brickfi.in/real-estate-developer/${slug}`,
      },
      twitter: {
        card: "summary",
        title,
        description,
      },
      alternates: {
        canonical: `https://www.brickfi.in/real-estate-developer/${slug}`,
      },
    };
  } catch (error) {
    console.error("[generateMetadata] error for slug:", slug, error);
    return {
      title: "Page Not Found",
      description: "The requested real estate developer could not be found.",
    };
  }
}

// main page
export default async function RealEstateDeveloperPage({ params }: PageProps) {
  const { developerId: slug } = await params;
  const queryClient = getQueryClient();

  const [headersList] = await Promise.all([
    headers(),
    queryClient.prefetchQuery(getRealEstateDeveloperBySlugQuery(slug)),
  ]); 
  const ua = headersList.get("user-agent") ?? "";
  const isMobileSSR = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RealEstateDeveloperClient slug={slug} initialIsMobile={isMobileSSR} />
    </HydrationBoundary>
  );
}
