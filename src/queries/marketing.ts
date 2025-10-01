import { baseApiUrl } from "@/libs/constants";
import { CustomError } from "@/libs/error-handler";
import { GlossaryArticle } from "@/types/Marketing";

// Get marketing data by type
export const getMarketing = async (type: string, throwError = true) => {
  const res = await fetch(`${baseApiUrl}marketing?type=${type}`, {
    cache: "no-store",
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

  if (data.length === 0 || (data.length > 1 && throwError)) {
    throw new CustomError({
      status: 404,
      title: "Something went wrong",
      description: "An unexpected error occurred.",
    });
  }

  return data[0];
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
  try {
    const { getGhostPageBySlug } = await import("@/libs/ghost-client");
    const article = await getGhostPageBySlug(slug);
    return article;
  } catch (error) {
    if (throwError) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("404")) {
        throw new CustomError({
          status: 404,
          title: "Article Not Found",
          description: "The requested glossary article could not be found.",
        });
      }

      throw new CustomError({
        status: 500,
        title: "Something went wrong",
        description: "An unexpected error occurred while fetching the article.",
      });
    }
    throw error;
  }
};

export const getGlossaryArticleBySlugQuery = (slug: string) => {
  return {
    queryKey: ["glossary-article", slug],
    queryFn: () => getGlossaryArticleBySlug(slug),
    throwOnError: true,
  };
};
