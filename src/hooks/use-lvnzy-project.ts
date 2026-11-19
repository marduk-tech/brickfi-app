// useFetchProjects.ts

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { LvnzyProject } from "../types/LvnzyProject";

/**
 * Custom hook to fetch a single project by its ID
 * @param {string} id - The ID of the project to fetch
 * @returns {UseQueryResult<Project, Error>} The result of the useQuery hook containing a single project
 */
export const useFetchLvnzyProjectById = (id: string) => {
  return useQuery<LvnzyProject, Error>({
    queryKey: [queryKeys.getLvnzyProjectById, id],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/lvnzy-projects/${id}`);
      return data as LvnzyProject;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 60000,
    gcTime: 300000,
  });
};

export const useFetchLvnzyProjectBySlug = (slug: string, enabled = true) => {
  const isId = useMemo(() => /^[a-f\d]{24}$/i.test(slug), [slug]);
  return useQuery<LvnzyProject, Error>({
    queryKey: isId
      ? [queryKeys.getLvnzyProjectById, slug]
      : [queryKeys.getLvnzyProjectById, "slug", slug],
    queryFn: async () => {
      const { data } = isId
        ? await axiosApiInstance.get(`/lvnzy-projects/${slug}`)
        : await axiosApiInstance.get(
            `/lvnzy-projects/slug/${slug.toLowerCase()}`
          );
      return data as LvnzyProject;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: enabled && !!slug,
    staleTime: 60000,
    gcTime: 300000,
  });
};

/**
 * Custom hook to fetch all lvnzy projects for admin users
 * @param {boolean} enabled - Whether to enable the query (should be true only for admin users)
 * @returns {UseQueryResult<LvnzyProject[], Error>} The result of the useQuery hook containing all lvnzy projects
 */
export const useFetchAllLvnzyProjects = (
  enabled: boolean = false,
  basic: boolean = false,
  onlyVerifiedReports: boolean = false,
) => {
  return useQuery<LvnzyProject[], Error>({
    queryKey: [queryKeys.getAllLvnzyProjects, basic, onlyVerifiedReports],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (basic) params.basic = "true";
      if (onlyVerifiedReports) params.onlyVerifiedReports = "true";

      const { data } = await axiosApiInstance.get(`/lvnzy-projects`, {
        params: Object.keys(params).length ? params : undefined,
      });
      return data as LvnzyProject[];
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
