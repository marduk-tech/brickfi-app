import { useMutation, useQuery } from "@tanstack/react-query";
import { notification } from "antd";
import { AxiosError } from "axios";
import {
  createCorridor,
  deleteCorridor,
  getAllCorridors,
  updateCorridor,
} from "../libs/api/corridors";
import { queryKeys } from "../libs/constants";
import { queryClient } from "../libs/query-client";
import { Corridor } from "../types/Corridor";
import { IdsOrAll } from "../components/map-view-v2/types";

/** `show`: "all" (the default - matches the old always-fetch-everything behavior for callers that don't care, e.g. find-projects-client's corridor filter list) fetches every corridor, a list of ids fetches just those, an empty array fetches nothing. */
export function useFetchCorridors(show: IdsOrAll = "all") {
  const ids = Array.isArray(show) ? show : undefined;
  return useQuery({
    queryKey: [queryKeys.getAllCorridors, show === "all" ? "all" : ids],
    queryFn: () => getAllCorridors(ids),
    enabled: show === "all" || !!ids?.length,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateCorridorMutation({
  corridorId,
  enableToasts = true,
}: {
  corridorId: string;
  enableToasts?: boolean;
}) {
  return useMutation({
    mutationFn: ({ corridorData }: { corridorData: Partial<Corridor> }) => {
      return updateCorridor(corridorId, corridorData);
    },

    onSuccess: () => {
      if (enableToasts) {
        notification.success({
          message: `Corridor updated`,
        });
      }
    },

    onError: (error: AxiosError<any>) => {
      notification.error({
        message: `An unexpected error occurred. Please try again later.`,
      });

      console.log(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.getAllCorridors],
      });
    },
  });
}

export function useCreateCorridorMutation() {
  return useMutation({
    mutationFn: (corridorData: Partial<Corridor>) => {
      return createCorridor(corridorData);
    },

    onSuccess: () => {
      notification.success({
        message: `Corridor created successfully!`,
      });
    },

    onError: (error: AxiosError<any>) => {
      notification.error({
        message: `An unexpected error occurred. Please try again later.`,
      });

      console.log(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.getAllCorridors],
      });
    },
  });
}

export function useDeleteCorridorMutation() {
  return useMutation({
    mutationFn: ({ corridorId }: { corridorId: string }) => {
      return deleteCorridor(corridorId);
    },

    onSuccess: () => {
      notification.success({
        message: `Corridor removed`,
      });
    },

    onError: (error: AxiosError<any>) => {
      notification.error({
        message: `An unexpected error occurred. Please try again later.`,
      });

      console.log(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.getAllCorridors],
      });
    },
  });
}
