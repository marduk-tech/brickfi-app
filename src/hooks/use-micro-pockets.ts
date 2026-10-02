import { useQuery } from "@tanstack/react-query";
import { getAllMicroPockets } from "../libs/api/micro-pockets";
import { queryKeys } from "../libs/constants";
import { IdsOrAll } from "../components/map-view-v2/types";

/** `show`: "all" fetches every micro-pocket, a list of ids fetches just those, an empty array (the default) fetches nothing - unlike useFetchLocalities/useFetchCorridors, nothing relied on a bare call fetching everything, so the default stays off. */
export function useFetchMicroPockets(show: IdsOrAll = []) {
  const ids = Array.isArray(show) ? show : undefined;
  return useQuery({
    queryKey: [queryKeys.getAllMicroPockets, show === "all" ? "all" : ids],
    queryFn: () => getAllMicroPockets(ids),
    enabled: show === "all" || !!ids?.length,
    refetchOnWindowFocus: false,
  });
}
