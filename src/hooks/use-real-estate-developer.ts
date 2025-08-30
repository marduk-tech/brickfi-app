// useFetchProjects.ts

import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { RealEstateDeveloper } from "@/types/RealEstateDeveloper";

/**
 * Custom hook to fetch all lvnzy projects for admin users
 * @param {boolean} enabled - Whether to enable the query (should be true only for admin users)
 * @returns {UseQueryResult<LvnzyProject[], Error>} The result of the useQuery hook containing all lvnzy projects
 */
export const useFetchAllRealEstateDevelopers = () => {
  return useQuery<RealEstateDeveloper[], Error>({
    queryKey: [queryKeys.getAllLvnzyProjects],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/real-estate-developer`);
      return data as RealEstateDeveloper[];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

/**
 * Custom hook to fetch a single project by its ID
 * @param {string} id - The ID of the project to fetch
 * @returns {UseQueryResult<Project, Error>} The result of the useQuery hook containing a single project
 */
export const useFetchRealEstateDeveloperId = (id: string) => {
  return useQuery<RealEstateDeveloper, Error>({
    queryKey: [queryKeys.getRealEstateDeveloperById, id],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/real-estate-developer/${id}`);
      return data as RealEstateDeveloper;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};
