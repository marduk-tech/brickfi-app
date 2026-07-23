import React, { useCallback, useEffect, useRef } from "react";
import * as turf from "@turf/turf";
import { LatLngTuple } from "leaflet";
import { useMap } from "react-leaflet";
import { ProjectMarkerInput } from "../types";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";

interface MapCenterHandlerProps {
  projectData: any;
  projects?: ProjectMarkerInput[];
  initialZoom?: number;
}

export const MapCenterHandler = ({ projectData, projects, initialZoom }: MapCenterHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (
      projectData &&
      projectData?.info?.location?.lat &&
      projectData?.info?.location?.lng
    ) {
      map.setView(
        [projectData.info.location.lat, projectData.info.location.lng],
        initialZoom || 12
      );
    } else if (projects && projects.length && projects.length < 10) {
      const projectsLoc = turf.points(
        projects
          .filter((p) => !!p.location?.lat && !!p.location?.lng)
          .map((p) => [p.location.lng, p.location.lat])
      );

      const center = turf.center(projectsLoc);
      map.setView(center.geometry.coordinates.reverse() as LatLngTuple, 12);
    }
  }, [projectData, map, projects, initialZoom]);

  return null;
};

interface MapFocusHandlerProps {
  projects?: ProjectMarkerInput[];
  focusedProjectId?: string | null;
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

const FOCUS_ZOOM = 15;

export const MapFocusHandler = ({ projects, focusedProjectId, openModal }: MapFocusHandlerProps) => {
  const map = useMap();
  const previousViewRef = useRef<{ center: LatLngTuple; zoom: number } | null>(null);

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

    map.setView([project.location.lat, project.location.lng], FOCUS_ZOOM);
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