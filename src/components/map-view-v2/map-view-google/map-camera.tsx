"use client";

import { useEffect, useRef } from "react";
import * as turf from "@turf/turf";
import { useMap } from "@vis.gl/react-google-maps";
import { ProjectMarkerInput } from "../types";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";

interface MapCentererProps {
  primaryProject?: any;
  projects?: ProjectMarkerInput[];
  initialZoom?: number;
}

export function MapCenterer({ primaryProject, projects, initialZoom }: MapCentererProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const lat = primaryProject?.info?.location?.lat;
    const lng = primaryProject?.info?.location?.lng;
    if (lat && lng) {
      map.setCenter({ lat, lng });
      map.setZoom(initialZoom ?? 14);
      return;
    }

    if (projects?.length && projects.length < 10) {
      const valid = projects.filter((p) => p.location?.lat && p.location?.lng);
      if (valid.length) {
        const pts = turf.points(valid.map((p) => [p.location.lng, p.location.lat]));
        const center = turf.center(pts);
        map.setCenter({
          lat: center.geometry.coordinates[1],
          lng: center.geometry.coordinates[0],
        });
        map.setZoom(initialZoom ?? 12);
      }
    }
  }, [map, primaryProject, projects, initialZoom]);

  return null;
}

interface MapFocusHandlerProps {
  projects?: ProjectMarkerInput[];
  focusedProjectId?: string | null;
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

const FOCUS_ZOOM = 16;

export function MapFocusHandler({ projects, focusedProjectId, openModal }: MapFocusHandlerProps) {
  const map = useMap();
  const previousViewRef = useRef<{ center: google.maps.LatLngLiteral; zoom: number } | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!focusedProjectId) {
      const previousView = previousViewRef.current;
      if (previousView) {
        map.setCenter(previousView.center);
        map.setZoom(previousView.zoom);
        previousViewRef.current = null;
      }
      return;
    }

    const project = projects?.find((p) => p.id === focusedProjectId);
    if (!project?.location?.lat || !project?.location?.lng) return;

    if (!previousViewRef.current) {
      const center = map.getCenter();
      previousViewRef.current = {
        center: center ? { lat: center.lat(), lng: center.lng() } : { lat: project.location.lat, lng: project.location.lng },
        zoom: map.getZoom() ?? FOCUS_ZOOM,
      };
    }

    map.panTo({ lat: project.location.lat, lng: project.location.lng });
    map.setZoom(FOCUS_ZOOM);
    openModal(project.modalContent, {
      lat: project.location.lat,
      lng: project.location.lng,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusedProjectId, projects]);

  return null;
}

interface MapReadyProps {
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapReady({ onMapReady }: MapReadyProps) {
  const map = useMap();
  useEffect(() => {
    if (map && onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}
