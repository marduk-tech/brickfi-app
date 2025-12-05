import { baseApiUrl, apiKey } from "@/libs/constants";
import { CustomError } from "@/libs/error-handler";
import { GlossaryArticle } from "@/types/Marketing";

// Get marketing data by type
export const getMarketing = async (type: string, throwError = true) => {
  const res = await fetch(`${baseApiUrl}marketing?type=${type}`, {
    // Revalidate every hour for sitemap generation
    next: { revalidate: 3600 },
    headers: {
      "x-api-key": apiKey || "",
    },
  });

  if (throwError && res.status === 404) {
    throw new CustomError({
      status: 404,
      title: "Marketing Content Not Found",
      description: "The requested marketing content could not be found.",
    });
  }

  if (throwError && res.status === 500) {
    throw new CustomError({
      status: 500,
      title: "Server Error",
      description: "An error occurred while fetching marketing content.",
    });
  }

  if (throwError && !res.ok) {
    throw new CustomError({
      status: res.status,
      title: "Something went wrong",
      description: "An unexpected error occurred.",
    });
  }

  return res.json();
};

// Get glossary data
export const getGlossary = async (throwError = true) => {
  const data = await getMarketing("glossary", throwError);

  if (data.length === 0 && throwError) {
    throw new CustomError({
      status: 404,
      title: "Something went wrong",
      description: "An unexpected error occurred.",
    });
  }

  return data;
};

// Query configuration for glossary data
export const getGlossaryQuery = () => {
  return {
    queryKey: ["marketing", "glossary"],
    queryFn: () => getGlossary(),
    throwOnError: true,
  };
};

export const getGlossaryArticleBySlug = async (
  slug: string,
  throwError = true
): Promise<GlossaryArticle> => {
  const res = await fetch(`${baseApiUrl}marketing/ghost-pages/${slug}`, {
    cache: "no-store",
    headers: {
      "x-api-key": apiKey || "",
    },
  });

  if (throwError && res.status === 404) {
    throw new CustomError({
      status: 404,
      title: "Article Not Found",
      description: "The requested glossary article could not be found.",
    });
  }

  if (throwError && res.status === 500) {
    throw new CustomError({
      status: 500,
      title: "Server Error",
      description: "An error occurred while fetching the article.",
    });
  }

  if (throwError && !res.ok) {
    throw new CustomError({
      status: res.status,
      title: "Something went wrong",
      description: "An unexpected error occurred while fetching the article.",
    });
  }

  return res.json();
};

export const getGlossaryArticleBySlugQuery = (slug: string) => {
  return {
    queryKey: ["glossary-article", slug],
    queryFn: () => getGlossaryArticleBySlug(slug),
    throwOnError: true,
  };
};

// Get all glossary terms (server-side compatible for sitemap)
export const getAllGlossaryTerms = async () => {
  try {
    const data = await getMarketing("glossary", false);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching glossary terms:", error);
    return [];
  }
};
