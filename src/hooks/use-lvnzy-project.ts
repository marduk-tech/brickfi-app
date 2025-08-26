// useFetchProjects.ts

import { useQuery } from "@tanstack/react-query";
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

/**
 * Custom hook to fetch all lvnzy projects for admin users
 * @param {boolean} enabled - Whether to enable the query (should be true only for admin users)
 * @returns {UseQueryResult<LvnzyProject[], Error>} The result of the useQuery hook containing all lvnzy projects
 */
export const useFetchAllLvnzyProjects = (enabled: boolean = false) => {
  return useQuery<LvnzyProject[], Error>({
    queryKey: [queryKeys.getAllLvnzyProjects],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/lvnzy-projects`);
      return data as LvnzyProject[];
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
