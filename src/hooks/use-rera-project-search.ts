import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";

export interface ReraProject {
  projectName: string;
  projectId: string;
  projectReraNumber: string;
  readyScore?: boolean;
}

export const useReraProjectSearch = () => {
  const { data: projects = [], isLoading } = useQuery<ReraProject[]>({
    queryKey: ["rera-projects"],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/rera-projects/names`);
      return data;
    },
  });

  return {
    projects,
    isLoading,
  };
};
