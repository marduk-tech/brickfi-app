import React from "react";
import L from "leaflet";
import { renderToString } from "react-dom/server";
import { Marker } from "react-leaflet";
import { COLORS } from "../../../theme/style-constants";
import { MapModalContent } from "../map-modal";
import { LocalityMarkerIcon } from "../locality-marker-icon";

interface LocalityMarkersProps {
  localities?: any[];
  setModalContent: (content: MapModalContent) => void;
  setInfoModalOpen: (open: boolean) => void;
}

export const LocalityMarkers = ({
  localities,
  setModalContent,
  setInfoModalOpen,
}: LocalityMarkersProps) => {
  if (!localities) {
    return null;
  }

  const LocalityIcon = L.divIcon({
    className: "", // prevent default icon styles
    html: renderToString(<LocalityMarkerIcon />),
    iconSize: [100, 100],
    iconAnchor: [50, 50],
  });

  return (
    <>
      {localities
        .filter((l) => !!l.location && !!l.location.lat)
        .map((locality) => {
          return (
            <Marker
              key={`locality-${locality._id}`}
              icon={LocalityIcon}
              position={[locality.location.lat, locality.location.lng]}
              eventHandlers={{
                click: () => {
                  setModalContent({
                    title: locality.name,
                    content: "",
                    tags: [
                      { label: "Growth corridor", color: COLORS.textColorDark },
                    ],
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          );
        })}
    </>
  );
};