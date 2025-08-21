import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";

export interface NearestTransitStation {
  driverId: string;
  stationName: string;
  distance: string;
  travelTime: number;
}

export interface NearestTransitStationsResponse {
  selectedLocation: {
    lat: number;
    lng: number;
  };
  nearestStations: NearestTransitStation[];
}

export const useNearestTransitStations = (lat?: number, lng?: number) => {
  return useQuery<NearestTransitStationsResponse>({
    queryKey: ["nearest-transit-stations", lat, lng],
    queryFn: async () => {
      if (!lat || !lng) throw new Error("Coordinates required");

      const response = await axiosApiInstance.post(
        "/livindex-places/nearest-transit-stations",
        {
          lat,
          lng,
        }
      );

      return response.data;
    },
    enabled: !!lat && !!lng,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};
