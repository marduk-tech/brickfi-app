"use client";

import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { DRIVER_CATEGORIES } from "../../../../libs/constants";
import { COLORS } from "../../../../theme/style-constants";
import { IDriverPlace } from "../../../../types/Project";
import { MapModalContent, MapModalGeoPosition } from "../../map-modal";

interface MicroMarketDriversProps {
  drivers?: IDriverPlace[];
  currentSelectedCategory: string;
  noCategoriesProvided: boolean;
  isDriverMatchingFilter: (driver: IDriverPlace) => boolean;
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

export function MicroMarketDrivers({
  drivers,
  currentSelectedCategory,
  noCategoriesProvided,
  isDriverMatchingFilter,
  openModal,
}: MicroMarketDriversProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !drivers?.length) return;
    const polys: google.maps.Polygon[] = [];

    const filtered = drivers.filter((d) => {
      const isAllowed = noCategoriesProvided ? true : (() => {
        const cats = (DRIVER_CATEGORIES as any)[currentSelectedCategory]?.drivers ?? [];
        return Array.isArray(cats) && cats.includes(d.driver);
      })();
      return d.driver === "micro-market" && !!(d as any).features?.[0]?.geometry?.coordinates?.[0] && isAllowed && isDriverMatchingFilter(d);
    });

    for (const driver of filtered) {
      const rawRing: [number, number][] = (driver as any).features[0].geometry.coordinates[0];
      const poly = new google.maps.Polygon({
        map,
        paths: rawRing.map(([lng, lat]) => ({ lat, lng })),
        strokeColor: COLORS.redIdentifier,
        strokeWeight: 1,
        strokeOpacity: 1,
        fillColor: COLORS.yellowIdentifier,
        fillOpacity: 0.2,
      });
      poly.addListener("click", (e: google.maps.PolyMouseEvent) =>
        openModal(
          {
            title: driver.name,
            content: driver.details?.oneLiner || driver.details?.description || "",
            tags: [{ label: "Micro Market", color: COLORS.primaryColor }],
          },
          e.latLng ? { lat: e.latLng.lat(), lng: e.latLng.lng() } : undefined,
        )
      );
      polys.push(poly);
    }

    return () => { polys.forEach((p) => p.setMap(null)); };
  }, [map, drivers, currentSelectedCategory, noCategoriesProvided, isDriverMatchingFilter, openModal]);

  return null;
}
