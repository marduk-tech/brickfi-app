import { apiKey, baseApiUrl, sitemapApiKey } from "@/libs/constants";
import { CustomError } from "@/libs/error-handler";

// Get developer by ObjectId (for internal operations)
export const getDeveloper = async (id: string, throwError = true) => {
  const res = await fetch(`${baseApiUrl}real-estate-developer/${id}`, {
    cache: "no-store",
    headers: {
      "x-api-key": sitemapApiKey || "",
    },
  });

  if (throwError && res.status === 404) {
    throw new CustomError({
      status: 404,
      title: "Real Estate Developer Not Found",
      description: "The requested real estate developer could not be found.",
    });
  }

  if (throwError && res.status === 500) {
    throw new CustomError({
      status: 500,
      title: "Invalid Developer ID",
      description: "The provided developer ID is invalid.",
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

// Get developer by slug (for public pages)
export const getDeveloperBySlug = async (slug: string, throwError = true) => {
  const res = await fetch(
    `${baseApiUrl}real-estate-developer/slug/${slug.toLowerCase()}`,
    {
      cache: "no-store",
      headers: {
        "x-api-key": sitemapApiKey || "",
      },
    },
  );

  if (throwError && res.status === 404) {
    throw new CustomError({
      status: 404,
      title: "Real Estate Developer Not Found",
      description: "The requested real estate developer could not be found.",
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

// Query for ObjectId-based operations (internal)
export const getRealEstateDevelopersQuery = (developerId: string) => {
  return {
    queryKey: ["real-estate-developer", developerId],
    queryFn: () => getDeveloper(developerId),
    throwOnError: true,
  };
};

// Query for slug-based operations (public pages)
export const getRealEstateDeveloperBySlugQuery = (slug: string) => {
  return {
    queryKey: ["real-estate-developer-slug", slug],
    queryFn: () => getDeveloperBySlug(slug),
    throwOnError: true,
  };
};

// Utility to check if identifier is ObjectId format
export const isObjectId = (str: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(str);
};

export const getAllDevelopersQuery = () => ({
  queryKey: ["all-real-estate-developers"],
  queryFn: () => getAllDevelopers(),
  throwOnError: true,
});

// Get all developers with slug preference
export const getAllDevelopers = async (params?: {
  keyword?: string;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.keyword) searchParams.append("keyword", params.keyword);
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const url = `${baseApiUrl}real-estate-developer${
    searchParams.toString() ? "?" + searchParams.toString() : ""
  }`;

  const res = await fetch(url, {
    //disable caching response data is larger than 2mb. next.js refuses to store 2mb+ data in the data cache

    cache: "no-store",
    next: { revalidate: 0 },

    headers: {
      "x-api-key": sitemapApiKey || apiKey || "",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch developers");
  }

  return res.json();
};
