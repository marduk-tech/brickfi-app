import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Flex, Typography } from "antd";
import { FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { useCallback, useEffect, useMemo } from "react";
import Supercluster, { ClusterProperties } from "supercluster";
import { useSupercluster } from "../../../../hooks/use-supercluster";
import { LivIndexDriversConfig } from "../../../../libs/constants";
import { LivIndexPlaceCard } from "../../map-old/livindex-place-card";

type ClusteredMarkersProps = {
  geojson: FeatureCollection<Point>;
  setNumClusters: (n: number) => void;
};

const superclusterOptions: Supercluster.Options<
  GeoJsonProperties,
  ClusterProperties
> = {
  extent: 256,
  radius: 80,
  maxZoom: 12,
};

export function ClusteredMarkers({
  geojson,
  setNumClusters,
}: ClusteredMarkersProps) {
  const { clusters, getChildren } = useSupercluster(
    geojson,
    superclusterOptions
  );

  useEffect(() => {
    setNumClusters(clusters.length);
    // console.log(clusters);
  }, [setNumClusters, clusters.length]);

  return (
    <>
      {clusters.map((feature) => {
        console.log(feature);

        const [lng, lat] = feature.geometry.coordinates;

        const clusterProperties = feature.properties as ClusterProperties;
        const isCluster: boolean = clusterProperties.cluster;

        return isCluster ? (
          <FeaturesClusterMarker
            key={feature.id}
            clusterId={clusterProperties.cluster_id}
            position={{ lat, lng }}
            size={clusterProperties.point_count}
            sizeAsText={String(clusterProperties.point_count_abbreviated)}
          />
        ) : (
          <FeatureMarker
            key={feature.id}
            featureId={feature.id as string}
            position={{ lat, lng }}
            geojson={geojson}
            clusterId={clusterProperties.cluster_id}
          />
        );
      })}
    </>
  );
}

type TreeClusterMarkerProps = {
  clusterId: number;
  onMarkerClick?: (
    marker: google.maps.marker.AdvancedMarkerElement,
    clusterId: number
  ) => void;
  position: google.maps.LatLngLiteral;
  size: number;
  sizeAsText: string;
};

export const FeaturesClusterMarker = ({
  position,
  size,
  sizeAsText,
  onMarkerClick,
  clusterId,
}: TreeClusterMarkerProps) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const handleClick = useCallback(
    () => onMarkerClick && onMarkerClick(marker!, clusterId),
    [onMarkerClick, marker, clusterId]
  );
  const markerSize = Math.floor(48 + Math.sqrt(size) * 2);
  return (
    <AdvancedMarker
      ref={markerRef}
      position={position}
      zIndex={size}
      onClick={handleClick}
      style={{ width: markerSize, height: markerSize }}
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
    >
      <div
        style={{
          width: "100%",
          height: "100%",

          backgroundImage: `url('/images/cluster-marker.png')`,
          backgroundSize: "cover", // Optional, adjusts how the image is displayed
          backgroundPosition: "center", // Optional, centers the image
          backgroundRepeat: "no-repeat", // Optional, prevents repeating

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography.Text style={{ color: "white", fontWeight: "bold" }}>
          {sizeAsText}
        </Typography.Text>
      </div>
    </AdvancedMarker>
  );
};

type TreeMarkerProps = {
  position: google.maps.LatLngLiteral;
  featureId: string;
  onMarkerClick?: (
    marker: google.maps.marker.AdvancedMarkerElement,
    featureId: string
  ) => void;
  geojson: FeatureCollection<Point>;
  clusterId: number;
};

export const FeatureMarker = ({
  position,
  featureId,
  onMarkerClick,
  geojson,
  clusterId,
}: TreeMarkerProps) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleClick = useCallback(
    () => onMarkerClick && onMarkerClick(marker!, featureId),
    [onMarkerClick, marker, featureId]
  );

  const feature = useMemo(
    () => geojson.features.find((f) => f.id === featureId),
    [geojson.features, featureId]
  );

  const featureName = feature?.properties?.name || "Unknown";

  let driverConfig;
  if (feature && feature.properties && feature.properties.type) {
    driverConfig = (LivIndexDriversConfig as any)[feature.properties.type];
  }

  return (
    <AdvancedMarker
      ref={markerRef}
      position={position}
      onClick={handleClick}
      anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
      className={"marker feature"}
    >
      <Flex>
        {/* <Tag
        >
          {featureName}
          
        </Tag> */}

        <LivIndexPlaceCard
          place={feature!.properties!.place}
        ></LivIndexPlaceCard>
        {/* <Tooltip title={featureName}>
          <Flex>
            <DynamicReactIcon
              iconName={driverConfig.icon.name}
              iconSet={driverConfig.icon.set}
              size={18}
              color="black"
            ></DynamicReactIcon>
          </Flex>
        </Tooltip> */}
      </Flex>
    </AdvancedMarker>
  );
};
