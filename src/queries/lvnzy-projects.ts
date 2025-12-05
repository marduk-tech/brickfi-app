import { baseApiUrl, apiKey } from "@/libs/constants";
import { CustomError } from "@/libs/error-handler";
import { LvnzyProject } from "@/types/LvnzyProject";

// Get project by ObjectId (for internal operations)
export const getLvnzyProjectById = async (id: string, throwError = true) => {
  const res = await fetch(`${baseApiUrl}lvnzy-projects/${id}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
  });

  if (throwError && res.status === 404) {
    throw new CustomError({
      status: 404,
      title: "Project Not Found",
      description: "The requested Brick360 project could not be found.",
    });
  }

  if (throwError && !res.ok) {
    throw new CustomError({
      status: res.status,
      title: "Something went wrong",
      description: "An unexpected error occurred.",
    });
  }

  const data = await res.json();
  return data;
};

// Get project by slug (for public pages)
export const getLvnzyProjectBySlug = async (
  slug: string,
  throwError = true
) => {
  const res = await fetch(
    `${baseApiUrl}lvnzy-projects/slug/${slug.toLowerCase()}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
    }
  );

  if (throwError && res.status === 404) {
    throw new CustomError({
      status: 404,
      title: "Project Not Found",
      description: "The requested Brick360 project could not be found.",
    });
  }

  if (throwError && !res.ok) {
    throw new CustomError({
      status: res.status,
      title: "Something went wrong",
      description: "An unexpected error occurred.",
    });
  }

  const data = await res.json();
  return data;
};

// Query for ObjectId-based operations (internal)
export const getLvnzyProjectByIdQuery = (id: string) => {
  return {
    queryKey: ["lvnzy-project", id],
    queryFn: () => getLvnzyProjectById(id),
    throwOnError: true,
    staleTime: 60000,
    gcTime: 300000,
  };
};

// Query for slug-based operations (public pages)
export const getLvnzyProjectBySlugQuery = (slug: string) => {
  return {
    queryKey: ["lvnzy-project-slug", slug],
    queryFn: () => getLvnzyProjectBySlug(slug),
    throwOnError: true,
    staleTime: 60000,
    gcTime: 300000,
  };
};
