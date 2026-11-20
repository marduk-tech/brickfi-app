import { getQueryClient } from "@/libs/query-client";
import {
  getDeveloperBySlug,
  getRealEstateDeveloperBySlugQuery,
} from "@/queries/real-estate-developer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { headers } from "next/headers";
import { cache } from "react";
import RealEstateDeveloperClient from "./real-estate-developer-client";
import { SEO_CONTENT } from "@/libs/constants";

interface PageProps {
  params: Promise<{ developerId: string }>;
}

const SITE_URL = "https://www.brickfi.in";

// One backend call per request, shared by generateMetadata and the page
// (which needs the developer for its structured data).
const getDeveloper = cache(async (slug: string) => {
  try {
    return await getDeveloperBySlug(slug, false);
  } catch (error) {
    console.error("[real-estate-developer] fetch error for slug:", slug, error);
    return null;
  }
});

const DESCRIPTIONS = [
  "View the Brickfi 360 Report to evaluate project performance, execution quality, and important checks before making a property investment.",
  "Check the Brickfi 360 Report for insights into completed developments, delivery credibility, and details that support better property decisions.",
  "See the Brickfi 360 Report to review project history, builder reputation, and essential factors buyers should know before investing.",
  "Explore the Brickfi 360 Report to learn about project delivery, track record, and what matters most when choosing a property.",
];

// One of DESCRIPTIONS, picked from the slug - varied across developers, but
// the same on every request for a given page (and the same in the meta tags
// and the structured data).
const descriptionFor = (slug: string): string => {
  let hash = 0;
  for (const ch of slug) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return DESCRIPTIONS[hash % DESCRIPTIONS.length];
};

const titleFor = (developer: any): string =>
  `${developer.name} | Brickfi 360 Report for Smarter Property Decisions`;

const buildJsonLd = (developer: any, slug: string) => {
  const url = `${SITE_URL}/real-estate-developer/${slug}`;
  const faq: any[] = (developer.info?.faq || []).filter(
    (q: any) => q?.question && q?.answer,
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: titleFor(developer),
        description: descriptionFor(slug),
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
      },
      // an FAQPage with no questions is invalid - only when there are some
      ...(faq.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faq.map((q: any) => ({
                "@type": "Question",
                name: q.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: q.answer,
                },
              })),
            },
          ]
        : []),
    ],
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { developerId: slug } = await params;
  const developer = await getDeveloper(slug);

  if (!developer || !developer.name) {
    return {
      title: "Real Estate Developer Not Found | Brickfi",
      description: "The requested real estate developer could not be found.",
    };
  }

  const title = titleFor(developer);
  const description = descriptionFor(slug);
  const url = `${SITE_URL}/real-estate-developer/${slug}`;

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
      url,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

// main page
export default async function RealEstateDeveloperPage({ params }: PageProps) {
  const { developerId: slug } = await params;
  const queryClient = getQueryClient();

  const [headersList, developer] = await Promise.all([
    headers(),
    getDeveloper(slug),
    queryClient.prefetchQuery(getRealEstateDeveloperBySlugQuery(slug)),
  ]);
  const ua = headersList.get("user-agent") ?? "";
  const isMobileSSR = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);

  return (
    <>
      {developer?.name ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildJsonLd(developer, slug)).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      ) : null}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <RealEstateDeveloperClient slug={slug} initialIsMobile={isMobileSSR} />
      </HydrationBoundary>
    </>
  );
}
