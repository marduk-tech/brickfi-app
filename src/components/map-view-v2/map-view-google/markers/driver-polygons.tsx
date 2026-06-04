"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { CATEGORY_COLORS, DRIVER_TYPE_COLORS } from "../../../../libs/constants";
import { COLORS } from "../../../../theme/style-constants";
import { IDriverPlace } from "../../../../types/Project";
import { MapModalContent } from "../../map-modal";
import { PolygonData } from "../../map-polygons";
import { processDriversToPolygons } from "../../utils";

interface DriverPolygonsProps {
  drivers?: IDriverPlace[];
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  openModal: (content: MapModalContent) => void;
  selectedDriverFilter?: string;
}

function getPolygonColor(polygon: PolygonData): string {
  if (polygon.driverType && DRIVER_TYPE_COLORS[polygon.driverType]) {
    return DRIVER_TYPE_COLORS[polygon.driverType];
  }
  if (polygon.category && CATEGORY_COLORS[polygon.category]) {
    return CATEGORY_COLORS[polygon.category];
  }
  return COLORS.redIdentifier;
}

export function DriverPolygons({
  drivers,
  currentSelectedCategory,
  noCategoriesProvided,
  isDriverMatchingFilter,
  openModal,
  selectedDriverFilter,
}: DriverPolygonsProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !drivers?.length) return;

    const polygons = processDriversToPolygons(
      drivers,
      !noCategoriesProvided,
      selectedDriverFilter,
      isDriverMatchingFilter,
      noCategoriesProvided ? undefined : currentSelectedCategory,
    );

    if (!polygons.length) return;

    const gPolys: google.maps.Polygon[] = [];

    const render = () => {
      gPolys.forEach((p) => p.setMap(null));
      gPolys.length = 0;

      const zoom = map.getZoom() ?? 0;
      if (zoom < 14) return;

      const bounds = map.getBounds();

      for (const poly of polygons) {
        if (
          bounds &&
          !poly.positions.some((pos: any[]) => bounds.contains({ lat: pos[0], lng: pos[1] }))
        ) {
          continue;
        }

        const color = getPolygonColor(poly);
        const gPoly = new google.maps.Polygon({
          map,
          paths: poly.positions.map(([lat, lng]: [number, number]) => ({ lat, lng })),
          strokeColor: color,
          strokeWeight: 2,
          strokeOpacity: 1,
          fillColor: color,
          fillOpacity: 0.3,
        });

        gPoly.addListener("click", () =>
          openModal({
            title: poly.name,
            content: poly.description || "",
            tags: [
              ...(poly.driverType ? [{ label: poly.driverType, color: COLORS.primaryColor }] : []),
            ],
          })
        );

        gPolys.push(gPoly);
      }
    };

    render();

    const zoomListener = map.addListener("zoom_changed", render);
    const moveListener = map.addListener("bounds_changed", render);

    return () => {
      gPolys.forEach((p) => p.setMap(null));
      google.maps.event.removeListener(zoomListener);
      google.maps.event.removeListener(moveListener);
    };
  }, [map, drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal, selectedDriverFilter]);

  return null;
}
