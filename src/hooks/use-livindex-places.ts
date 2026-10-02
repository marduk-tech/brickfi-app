import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { IDriverPlace } from "../types/Project";

export const getAllLivIndexPlaces = async (
  driversIds?: string[],
  driverTypes?: string[]
) => {
  const endpoint = `/livindex-places`;
  return axiosApiInstance
    .post("/livindex-places", {
      driverIds: driversIds || [],
      driverTypes: driverTypes || [],
    })
    .then((response) => {
      return response.data as IDriverPlace[];
    });
};

export function useFetchAllLivindexPlaces(
  driverIds?: string[],
  driverTypes?: string[],
  enabled: boolean = true
) {
  return useQuery<IDriverPlace[]>({
    queryKey: [queryKeys.getAllPlaces, driverTypes || "", driverIds || ""],
    queryFn: () => getAllLivIndexPlaces(driverIds, driverTypes),
    refetchOnWindowFocus: false,
    enabled,
  });
}

export const fetchLvnzyProjectDrivers = async (lvnzyProjectIds: string[]) => {
  return axiosApiInstance
    .post("/livindex-places/lvnzy-project-drivers", { lvnzyProjectIds })
    .then((response) => {
      return response.data as IDriverPlace[];
    });
};

// Fetches the deduped neighborhood/connectivity drivers for whichever
// lvnzyProjectIds are currently in a brickchat results list - one batched
// call instead of one per project (see fetchLvnzyProjectDrivers controller).
export function useFetchLvnzyProjectDrivers(
  lvnzyProjectIds?: string[],
  enabled: boolean = true
) {
  return useQuery<IDriverPlace[]>({
    queryKey: [queryKeys.getLvnzyProjectDrivers, lvnzyProjectIds || []],
    queryFn: () => fetchLvnzyProjectDrivers(lvnzyProjectIds || []),
    refetchOnWindowFocus: false,
    enabled: enabled && !!lvnzyProjectIds?.length,
  });
}
