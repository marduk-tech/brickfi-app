import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../libs/constants";
import { getAllLocalities } from "../libs/api/localities";
import { IdsOrAll } from "../components/map-view-v2/types";

/** `show`: "all" (the default - matches the old always-fetch-everything behavior for callers that don't care) fetches every locality, a list of ids fetches just those, an empty array fetches nothing. */
export function useFetchLocalities(show: IdsOrAll = "all") {
  const ids = Array.isArray(show) ? show : undefined;
  return useQuery({
    queryKey: [queryKeys.getAllLocalities, show === "all" ? "all" : ids],
    queryFn: () => getAllLocalities(ids),
    enabled: show === "all" || !!ids?.length,
    refetchOnWindowFocus: false,
  });
}
