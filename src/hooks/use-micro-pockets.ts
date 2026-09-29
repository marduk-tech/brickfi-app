import { useQuery } from "@tanstack/react-query";
import { getAllMicroPockets } from "../libs/api/micro-pockets";
import { queryKeys } from "../libs/constants";

export function useFetchMicroPockets(enabled: boolean = true) {
  return useQuery({
    queryKey: [queryKeys.getAllMicroPockets],
    queryFn: () => getAllMicroPockets(),
    refetchOnWindowFocus: false,
    enabled,
  });
}
