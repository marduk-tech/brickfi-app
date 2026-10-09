import { apiKey, baseApiUrl, sitemapApiKey } from "@/libs/constants";
import { CustomError } from "@/libs/error-handler";
import { LvnzyProject } from "@/types/LvnzyProject";
import { ProjectResult } from "@/app/app/brickchat/brickchat-client";

// Get project by ObjectId (for internal operations)
export const getLvnzyProjectById = async (
  id: string,
  throwError = true,
  runOnServer = false,
) => {
  const res = await fetch(`${baseApiUrl}lvnzy-projects/${id}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": (runOnServer ? sitemapApiKey : apiKey) || "",
    },
  });

  if (!res.ok) {
    if (throwError) {
      throw new CustomError({
        status: res.status,
        title:
          res.status === 404 ? "Project Not Found" : "Something went wrong",
        description:
          res.status === 404
            ? "The requested Brick360 project could not be found."
            : "An unexpected error occurred.",
      });
    }
    return null;
  }

  const data = await res.json();
  return data;
};

// Get project by slug (for public pages)
export const getLvnzyProjectBySlug = async (
  slug: string,
  throwError = true,
) => {
  const res = await fetch(
    `${baseApiUrl}lvnzy-projects/slug/${slug.toLowerCase()}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
    },
  );

  if (!res.ok) {
    if (throwError) {
      throw new CustomError({
        status: res.status,
        title:
          res.status === 404 ? "Project Not Found" : "Something went wrong",
        description:
          res.status === 404
            ? "The requested Brick360 project could not be found."
            : "An unexpected error occurred.",
      });
    }
    return null;
  }

  const data = await res.json();
  return data;
};

// Project "card" display data (same shape as any other brickchat project
// result - see buildProjectListItem in the backend's
// project-display-cache.service.js) for a batch of projectIds - used for
// user.savedLvnzyProjects[0].projects (see usePinnedProjects), which only
// ever stores a lightweight {projectId} reference, not a full project
// object the client could map itself. Order of projectIds is preserved by
// the backend; an id with no matching project is simply dropped.
export const getLvnzyProjectsDisplayCards = async (
  projectIds: string[],
): Promise<ProjectResult[]> => {
  if (!projectIds.length) return [];

  const res = await fetch(`${baseApiUrl}lvnzy-projects/display-cache`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify({ projectIds }),
  });

  if (!res.ok) return [];

  const data: ProjectResult[] = await res.json();
  // buildProjectListItem omits oneLiner/rankScore entirely when neither
  // applies (dropped by JSON.stringify) - default them here so this still
  // satisfies ProjectResult's (non-optional) shape.
  return (data || []).map((p) => ({
    ...p,
    oneLiner: p.oneLiner || "",
    rankScore: p.rankScore || 0,
  }));
};

// One project card (same shape as getLvnzyProjectsDisplayCards' entries) by
// any of its identifiers - originalProjectId, lvnzyProjectId or slug, all
// resolved server-side (see resolveProjectId in the backend's
// project-display-cache.service.js). null when nothing matches.
export const getLvnzyProjectDisplayCard = async (
  idOrSlug: string,
): Promise<ProjectResult | null> => {
  const res = await fetch(
    `${baseApiUrl}lvnzy-projects/display-cache/${encodeURIComponent(idOrSlug)}`,
    {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey || "",
      },
    },
  );

  if (!res.ok) return null;

  const p: ProjectResult = await res.json();
  return { ...p, oneLiner: p.oneLiner || "", rankScore: p.rankScore || 0 };
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
