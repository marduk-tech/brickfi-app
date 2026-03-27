// useFetchProjects.ts

import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { Project } from "../types/Project";

/**
 * Custom hook to fetch all projects
 * @returns {UseQueryResult<Project[], Error>} The result of the useQuery hook containing an array of projects
 */
export const useFetchProjects = (params: {
  homeType?: string;
  statusFilter?: string;
  searchKeyword?: string;
  projectIds?: string;
  limit?: number;
  sortBy?: string;
}) => {
  return useQuery<Project[], Error>({
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on network reconnect
    staleTime: Infinity, // Data will never be marked as stale
    queryKey: [queryKeys.projects, Object.entries(params).map(([key, value]) => value).join(",")],
    queryFn: async () => {
      if (Object.entries(params).length) {
        let url = `/projects?source=app`;
        if (params.statusFilter) {
          url += `&statusFilter=${params.statusFilter}`;
        }
        if (params.homeType) {
          url += `&homeType=${params.homeType}`;
        }
        if (params.searchKeyword) {
          url += `&keyword=${params.searchKeyword}`;
        }
         if (params.projectIds) {
          url += `&projectIds=${params.projectIds}`;
        }
        const { data } = await axiosApiInstance.get(url);
        return data;
      }
      return [];
      
    },
  });
};

/**
 * Custom hook to fetch a single project by its ID
 * @param {string} id - The ID of the project to fetch
 * @returns {UseQueryResult<Project, Error>} The result of the useQuery hook containing a single project
 */
export const useFetchProjectById = (id: string) => {
  return useQuery<Project, Error>({
    queryKey: [queryKeys.getProjectById, id],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/projects/${id}`);
      return data as Project;
    },
    refetchOnWindowFocus: false,
  });
};
