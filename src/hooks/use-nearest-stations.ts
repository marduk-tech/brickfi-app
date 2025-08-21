import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";

export interface NearestStation {
  stationId: string;
  driverName: string;
  stationName: string;
  distance: string;
  travelTime: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface NearestStationsResponse {
  selectedLocation: {
    lat: number;
    lng: number;
  };
  nearestStations: NearestStation[];
}

export const useNearestStations = (lat?: number, lng?: number) => {
  return useQuery<NearestStationsResponse>({
    queryKey: ["nearest-stations", lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error("Coordinates required");

      const response = await axiosApiInstance.post(
        "/livindex-places/nearest-stations",
        {
          lat,
          lng,
        }
      );

      return response.data;
    },
    enabled: !!lat && !!lng,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
