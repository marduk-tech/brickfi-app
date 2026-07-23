"use client";

import React from "react";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { COLORS } from "../../../../theme/style-constants";
import { MapModalContent, MapModalGeoPosition } from "../../map-modal";
import { LocalityMarkerIcon } from "../../locality-marker-icon";

interface LocalityMarkersProps {
  localities?: any[];
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

export function LocalityMarkers({ localities, openModal }: LocalityMarkersProps) {
  return (
    <>
      {localities
        ?.filter((l) => l.location?.lat && l.location?.lng)
        .map((locality) => (
          <AdvancedMarker
            key={`locality-${locality._id}`}
            position={{ lat: locality.location.lat, lng: locality.location.lng }}
            onClick={() =>
              openModal(
                {
                  title: locality.name,
                  content: "",
                  tags: [{ label: "Growth corridor", color: COLORS.textColorDark }],
                },
                { lat: locality.location.lat, lng: locality.location.lng },
              )
            }
          >
            <LocalityMarkerIcon />
          </AdvancedMarker>
        ))}
    </>
  );
}
