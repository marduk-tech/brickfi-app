import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { Project } from "../types/Project";
export interface WITHLVNZYRESPONSE {
  projectName: string;
  projectId: string;
  lvnzyProjectId: string | null;
}

export const useProjectSearch = () => {
  const { data: projects = [], isLoading } = useQuery<WITHLVNZYRESPONSE[]>({
    queryKey: ["projects-with-lvnzy"],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/projects/with-lvnzy`);
      return data;
    },
  });

  return {
    projects,
    isLoading,
  };
};

/**
 * Custom hook to fetch projects optimized for map view with type filtering
 * @param {string} type - The home type to filter projects by
 * @returns {UseQueryResult<Project[], Error>} The result of the useQuery hook containing an array of filtered projects
 */
export const useFetchProjectsForMapView = (type: string) => {
  return useQuery<Project[], Error>({
    queryKey: [queryKeys.projectsMapView, type],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(
        `/projects/map-view?type=${type}`
      );
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!type, // Only run query if type is provided
  });
};
