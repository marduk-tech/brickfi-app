import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { FeatureCollection, Point } from "geojson";
import { useEffect, useState } from "react";
import { useFetchAllLivindexPlaces } from "../../../../hooks/use-livindex-places";
import { Loader } from "../../../common/loader";
import { ClusteredMarkers } from "./clustered-markers";
import { ConnectivityInfra } from "../../map-old/connectivity-infra";
import brightColorsStyles from "../map-styles/bright-colors";

export type CastleFeatureProps = {
  name?: string;
  heading?: string;
  description?: string;
  placeId?: string;
  type?: string;
};

const MAP_STYLE_BRIGHT = {
  id: "styled1",
  label: 'Raster / "Bright Colors" (no mapId)',
  mapTypeId: "roadmap",
  styles: brightColorsStyles,
};

export type LivIndexPlacesGeoJson = FeatureCollection<
  Point,
  CastleFeatureProps
>;

export function LivIndexAllMapView() {
  const { data: livindexPlaces, isLoading: livindexPlacesLoading } =
    useFetchAllLivindexPlaces();

  const [geojson, setGeojson] = useState<LivIndexPlacesGeoJson | null>(null);
  const [numClusters, setNumClusters] = useState(4);
  const [connectivityData, setConnectivityData] = useState<any[]>();

  useEffect(() => {
    if (livindexPlaces) {
      const formattedPlaces = livindexPlaces
        .filter((place) => place.driver !== "highway")
        .filter((place) => place.location?.lat && place.location?.lng);

      const roads = livindexPlaces.filter(
        (place) => place.driver === "highway" || place.driver === "transit"
      );
      setConnectivityData(roads);

      const formattedGeoJson: LivIndexPlacesGeoJson = {
        type: "FeatureCollection",
        features: formattedPlaces.map((place) => {
          const { lat, lng } = place.location!;

          // coordinates expects lng first then lat
          const cords = [lng, lat];

          return {
            type: "Feature",
            id: place._id,
            geometry: {
              type: "Point",
              coordinates: cords as any,
            },
            place,
            properties: {
              place,
              name: place.name || "",
              details: place.details || "",
              placeId: place._id || "",
              type: place.driver,
            },
          };
        }),
      };

      setGeojson(formattedGeoJson);
    }
  }, [livindexPlaces]);

  if (livindexPlacesLoading) {
    return <Loader />;
  }

  if (livindexPlaces && geojson) {
    return (
      <APIProvider apiKey={"AIzaSyADagII4pmkrk8R1VVsEzbz0qws3evTYfQ"}>
        <Map
          mapId={"bf51a910020fa25a"}
          defaultCenter={{ lat: 14.5638117, lng: 77.8884163 }}
          defaultZoom={7}
          gestureHandling={"greedy"}
          mapTypeId={MAP_STYLE_BRIGHT.mapTypeId}
          styles={MAP_STYLE_BRIGHT.styles}
          disableDefaultUI={true}
        >
          {geojson && (
            <ClusteredMarkers
              geojson={geojson}
              setNumClusters={setNumClusters}
            />
          )}
          {connectivityData &&
            connectivityData.map((placeData) => {
              return (
                <ConnectivityInfra
                  connectivityData={placeData}
                ></ConnectivityInfra>
              );
            })}
        </Map>
      </APIProvider>
    );
  }
}
