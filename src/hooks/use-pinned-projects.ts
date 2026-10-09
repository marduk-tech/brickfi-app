"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "./use-user";
import { ProjectResult } from "@/app/app/brickchat/brickchat-client";
import { getLvnzyProjectsDisplayCards } from "@/queries/lvnzy-projects";

interface UsePinnedProjectsResult {
  defaultProjectResults: ProjectResult[] | undefined;
  defaultProjectsDescription: string | undefined;
  isLoading: boolean;
}

// display-cache is keyed by the ORIGINAL Project id (originalProjectId), not
// the LvnzyProject's own _id - GET /auth/myinfo populates
// savedLvnzyProjects.projects with originalProjectId (see fetchUserDetails in
// auth.controller.js), so it's normally an object, but fall back to a bare id.
const getOriginalProjectId = (lp: any): string | undefined => {
  const original = lp?.originalProjectId;
  return (original?._id || original)?.toString() || undefined;
};

export function usePinnedProjects(): UsePinnedProjectsResult {
  const { user, isLoading: userLoading } = useUser();

  const firstCollection = user?.savedLvnzyProjects?.[0];
  const projectIds: string[] = (firstCollection?.projects || [])
    .map(getOriginalProjectId)
    .filter((id: string | undefined): id is string => !!id);

  // Always the same card shape brickchat's own results use (built server-side
  // by buildProjectListItem), rather than mapping the populated LvnzyProject
  // docs on the client. Order of projectIds is preserved by the backend.
  const { data, isLoading: cardsLoading } = useQuery<ProjectResult[], Error>({
    queryKey: ["pinned-projects-display-cache", projectIds],
    queryFn: () => getLvnzyProjectsDisplayCards(projectIds),
    enabled: !userLoading && projectIds.length > 0,
    refetchOnWindowFocus: false,
  });

  const hasNoPinned = !userLoading && projectIds.length === 0;

  return {
    defaultProjectResults: hasNoPinned ? [] : data,
    defaultProjectsDescription: firstCollection?.collectionDescription || undefined,
    isLoading: userLoading || (!hasNoPinned && cardsLoading),
  };
}
