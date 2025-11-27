import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";

export interface MarketingProject {
  projectName: string;
  reraNumber?: string;
  lvnzyProjectId?: string;
}

export const useMarketingProjectSearch = () => {
  const { data: projects = [], isLoading } = useQuery<MarketingProject[]>({
    queryKey: ["project-names"],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/marketing/project-names`);
      return data;
    },
  });

  return {
    projects,
    isLoading,
  };
};
