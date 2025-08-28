import React, { useCallback, useEffect, useRef } from "react";
import * as turf from "@turf/turf";
import { LatLngTuple } from "leaflet";
import { useMap } from "react-leaflet";

interface MapCenterHandlerProps {
  projectData: any;
  projects?: any[];
}

export const MapCenterHandler = ({ projectData, projects }: MapCenterHandlerProps) => {
  const map = useMap();
  
  useEffect(() => {
    if (
      projectData &&
      projectData?.info?.location?.lat &&
      projectData?.info?.location?.lng
    ) {
      map.setView(
        [projectData.info.location.lat, projectData.info.location.lng],
        13
      );
    } else if (projects && projects.length && projects.length < 10) {
      const projectsLoc = turf.points(
        projects
          .filter((p) => !!p.info.location && !!p.info.location.lat)
          .map((p) => {
            return [p.info.location.lng, p.info.location.lat];
          })
      );

      const center = turf.center(projectsLoc);
      map.setView(center.geometry.coordinates.reverse() as LatLngTuple, 12);
      console.warn("Project data missing location:", projectData);
    }
  }, [projectData, map, projects]);

  return null;
};

export const MapResizeHandler = () => {
  const map = useMap();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // handle map refresh
  const handleMapRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      map.invalidateSize();
      map.setView(map.getCenter(), map.getZoom());
    }, 100);
  }, [map]);

  useEffect(() => {
    map.on("layeradd layerremove", handleMapRefresh);
    return () => {
      map.off("layeradd layerremove", handleMapRefresh);
    };
  }, [map, handleMapRefresh]);

  useEffect(() => {
    containerRef.current = map.getContainer();
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleMapRefresh);
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
    };
  }, [map, handleMapRefresh]);

  return null;
};

interface MapInstanceCaptureProps {
  onMapReady: (map: any) => void;
}

export const MapInstanceCapture = ({ onMapReady }: MapInstanceCaptureProps) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
};