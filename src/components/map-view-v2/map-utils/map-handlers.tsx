import * as turf from "@turf/turf";
import { LatLngTuple } from "leaflet";
import React, { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";
import { ProjectMarkerInput } from "../types";

interface MapCenterHandlerProps {
  projectData: any;
  projects?: ProjectMarkerInput[];
  initialZoom?: number;
  fitPoints?: { lat: number; lng: number }[];
}

export const MapCenterHandler = ({
  projectData,
  projects,
  initialZoom,
  fitPoints,
}: MapCenterHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (fitPoints?.length) {
      const points: LatLngTuple[] = fitPoints.map((p) => [p.lat, p.lng]);
      if (
        projectData?.info?.location?.lat &&
        projectData?.info?.location?.lng
      ) {
        points.push([
          projectData.info.location.lat,
          projectData.info.location.lng,
        ]);
      }
      // no animation: MapResizeHandler's setView on layeradd would cut an animated pan short
      const fit = () =>
        map.fitBounds(points, { padding: [24, 24], animate: false });
      const hasSize = () => {
        const size = map.invalidateSize().getSize();
        return size.x > 0 && size.y > 0;
      };

      if (!hasSize()) {
        const onResize = () => {
          if (!hasSize()) return;
          map.off("resize", onResize);
          fit();
        };
        map.on("resize", onResize);
        return () => {
          map.off("resize", onResize);
        };
      }
      fit();
    } else if (
      projectData &&
      projectData?.info?.location?.lat &&
      projectData?.info?.location?.lng
    ) {
      map.setView(
        [projectData.info.location.lat, projectData.info.location.lng],
        initialZoom || 12,
      );
    } else if (projects && projects.length && projects.length < 10) {
      const projectsLoc = turf.points(
        projects
          .filter((p) => !!p.location?.lat && !!p.location?.lng)
          .map((p) => [p.location.lng, p.location.lat]),
      );

      const center = turf.center(projectsLoc);
      map.setView(center.geometry.coordinates.reverse() as LatLngTuple, 12);
    }
  }, [projectData, map, projects, initialZoom, fitPoints]);

  return null;
};

interface MapFocusHandlerProps {
  projects?: ProjectMarkerInput[];
  focusedProjectId?: string | null;
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

const FOCUS_ZOOM = 15;

export const MapFocusHandler = ({
  projects,
  focusedProjectId,
  openModal,
}: MapFocusHandlerProps) => {
  const map = useMap();
  const previousViewRef = useRef<{ center: LatLngTuple; zoom: number } | null>(
    null,
  );

  useEffect(() => {
    if (!focusedProjectId) {
      const previousView = previousViewRef.current;
      if (previousView) {
        map.setView(previousView.center, previousView.zoom);
        previousViewRef.current = null;
      }
      return;
    }

    const project = projects?.find((p) => p.id === focusedProjectId);
    if (!project?.location?.lat || !project?.location?.lng) return;

    if (!previousViewRef.current) {
      const center = map.getCenter();
      previousViewRef.current = {
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      };
    }

    map.setView([project.location.lat, project.location.lng]);
    openModal(project.modalContent, {
      lat: project.location.lat,
      lng: project.location.lng,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusedProjectId, projects]);

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
