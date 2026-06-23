"use client";

import { useEffect, useState } from "react";
import { useUser } from "./use-user";
import { ProjectResult } from "@/app/app/brickchat/brickchat-client";

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
      .map((lp: any) => {
        const minCost = lp.meta?.costingDetails?.minimumUnitCost;
        const minSize = lp.meta?.costingDetails?.minimumUnitSize;
        const corridors: any[] = lp.meta?.projectCorridors || [];
        const nearestCorridor = corridors.length
          ? corridors.reduce((a: any, b: any) =>
              (a.approxDistanceInKms ?? Infinity) <= (b.approxDistanceInKms ?? Infinity) ? a : b
            )
          : undefined;

        return {
          projectId: lp.originalProjectId?._id || "",
          projectName: lp.meta?.projectName || "",
          lvnzyProjectId: lp._id,
          projectSlug: lp.slug,
          projectLocation: lp.originalProjectId?.info?.location || { lat: 0, lng: 0 },
          projectImage: (
            lp.originalProjectId?.media?.find((m: any) => m.type === "image" && m.isPreview) ||
            lp.originalProjectId?.media?.find((m: any) => m.type === "image" && m.image.tags.includes("exterior")) ||
            lp.originalProjectId?.media?.find((m: any) => m.type === "image" && m.image.tags.includes("amenity"))
          )?.image.url,
          projectHomeTypes: lp.originalProjectId?.info?.homeType,
          sizeBuiltupMin: minSize || undefined,
          projectAvgSquareFootPrice: minCost && minSize ? Math.round(minCost / minSize) : undefined,
          projectCorridor: nearestCorridor.corridorName,
        };
      })
      .filter((p: ProjectResult) => p.projectName);

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
