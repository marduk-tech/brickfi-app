"use client";

import { useEffect } from "react";
import * as turf from "@turf/turf";
import { useMap } from "@vis.gl/react-google-maps";
import { ProjectMarkerInput } from "../types";

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
