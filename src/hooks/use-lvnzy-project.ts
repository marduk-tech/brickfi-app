// useFetchProjects.ts

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { CustomError } from "../libs/error-handler";
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

/**
 * Custom hook to fetch projecst by multiple Ids
 * @param {string} ids - comma separate list of Ids
 * @returns {UseQueryResult<Project, Error>} The result of the useQuery hook containing a single project
 */
export const useFetchLvnzyProjectsByIds = (ids: string) => {
  return useQuery<LvnzyProject, Error>({
    queryKey: [queryKeys.getLvnzyProjectsByIds, ids],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/lvnzy-projects/${ids}`);
      return data as LvnzyProject;
    },
    refetchOnWindowFocus: false,
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

export const useFetchAccessibleLvnzyProjectBySlug = ({
  slug,
  userId,
  enabled = true,
}: {
  slug: string;
  userId: string;
  enabled?: boolean;
}) => {
  return useQuery<LvnzyProject, Error>({
    queryKey: [queryKeys.getLvnzyProjectById, "app-report", slug, userId],
    queryFn: async () => {
      try {
        const { data } = await axiosApiInstance.post(
          `/lvnzy-projects/app-report/slug/${slug.toLowerCase()}`,
          { userId },
        );
        return data as LvnzyProject;
      } catch (error: any) {
        const status = error?.response?.status || 500;
        throw new CustomError({
          status,
          title: status === 403 ? "Access Denied" : "Something went wrong",
          description:
            error?.response?.data?.message ||
            "An unexpected error occurred while loading the report.",
        });
      }
    },
    enabled: enabled && !!slug && !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
) => {
  return useQuery<LvnzyProject[], Error>({
    queryKey: [queryKeys.getAllLvnzyProjects, basic],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/lvnzy-projects`, {
        params: basic ? { basic: "true" } : undefined,
      });
      return data as LvnzyProject[];
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
