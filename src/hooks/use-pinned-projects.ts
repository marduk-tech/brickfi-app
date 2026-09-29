"use client";

import { useEffect, useState } from "react";
import { useUser } from "./use-user";
import { ProjectResult } from "@/app/app/brickchat/brickchat-client";
import { mapLvnzyProjectToResult } from "@/libs/lvnzy-helper";

interface UsePinnedProjectsResult {
  defaultProjectResults: ProjectResult[] | undefined;
  defaultProjectsDescription: string | undefined;
  isLoading: boolean;
}

export function usePinnedProjects(): UsePinnedProjectsResult {
  const { user, isLoading: userLoading } = useUser();
  const [defaultProjectResults, setDefaultProjectResults] = useState<ProjectResult[] | undefined>();
  const [defaultProjectsDescription, setDefaultProjectsDescription] = useState<string | undefined>();

  useEffect(() => {
    if (userLoading) return;

    if (!user?._id || !user.savedLvnzyProjects?.length) {
      setDefaultProjectResults([]);
      return;
    }

    const firstCollection = user.savedLvnzyProjects[0];
    const projects = firstCollection?.projects;

    if (!projects?.length) {
      setDefaultProjectResults([]);
      return;
    }

    const mapped: ProjectResult[] = projects
      .map((lp: any) => mapLvnzyProjectToResult(lp))
      .filter((p: ProjectResult | null): p is ProjectResult => !!p?.projectName);

    setDefaultProjectResults(mapped);

    if (firstCollection.collectionDescription) {
      setDefaultProjectsDescription(firstCollection.collectionDescription);
    }
  }, [userLoading, user?._id, user?.savedLvnzyProjects]);

  return {
    defaultProjectResults,
    defaultProjectsDescription,
    isLoading: userLoading || defaultProjectResults === undefined,
  };
}
