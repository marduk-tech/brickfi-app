import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../libs/constants";
import { getAllLocalities } from "../libs/api/localities";

export function useFetchLocalities() {
  return useQuery({
    queryKey: [queryKeys.getAllLocalities],
    queryFn: () => getAllLocalities(),
    refetchOnWindowFocus: false,
  });
}
