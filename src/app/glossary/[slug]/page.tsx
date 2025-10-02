import { getQueryClient } from "@/libs/query-client";
import {
  getGlossaryArticleBySlug,
  getGlossaryArticleBySlugQuery,
} from "@/queries/marketing";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import GlossaryArticleClient from "./glossary-article-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getGlossaryArticleBySlug(slug, false);

    if (!article) {
      return {
        title: "Article Not Found | Brickfi",
        description: "The requested glossary article could not be found.",
      };
    }

    const title = article.meta_title || article.title || "Glossary Article | Brickfi";
    const description =
      article.meta_description ||
      article.excerpt ||
      "Real estate glossary article from Brickfi.";

    return {
      title,
      description,
      keywords: [
        "real estate",
        "glossary",
        "property terms",
        "brickfi",
      ],
      openGraph: {
        title,
        description,
        type: "article",
        url: `https://brickfi.in/glossary/${slug}`,
        images: article.feature_image ? [article.feature_image] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: article.feature_image ? [article.feature_image] : [],
      },
      alternates: {
        canonical: `https://brickfi.in/glossary/${slug}`,
      },
    };
  } catch (error) {
    return {
      title: "Article Not Found | Brickfi",
      description: "The requested glossary article could not be found.",
    };
  }
}

export default async function GlossaryArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getGlossaryArticleBySlugQuery(slug));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <GlossaryArticleClient slug={slug} />
    </HydrationBoundary>
  );
}
