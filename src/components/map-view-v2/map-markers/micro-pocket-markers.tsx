import React, { useEffect, useState } from "react";
import { Marker, Polygon, useMap, useMapEvent } from "react-leaflet";
import { COLORS } from "../../../theme/style-constants";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";
import { getIcon } from "../utils";
import DynamicReactIcon from "../../common/dynamic-react-icon";

const MICROPOCKET_MAX_ZOOM = 13.5;

interface MicroPocketMarkersProps {
  microPockets?: any[];
  setModalContent: (content: MapModalContent, position?: MapModalGeoPosition) => void;
  setInfoModalOpen: (open: boolean) => void;
}

function useIsBelowMicroPocketZoom() {
  const map = useMap();
  const [isBelow, setIsBelow] = useState(map.getZoom() < MICROPOCKET_MAX_ZOOM);

  useMapEvent("zoomend", () => {
    setIsBelow(map.getZoom() < MICROPOCKET_MAX_ZOOM);
  });

  return isBelow;
}

export const MicroPocketMarkers = ({
  microPockets,
  setModalContent,
  setInfoModalOpen,
}: MicroPocketMarkersProps) => {
  const [microPocketElements, setMicroPocketElements] =
    useState<React.ReactNode[]>();
  const isBelowMicroPocketZoom = useIsBelowMicroPocketZoom();

  useEffect(() => {
    if (!microPockets) {
      return;
    }

    const renderMicroPocketElements = async () => {
      const elements = await Promise.all(
        microPockets.map(async (m) => {
          const MicroPocketIcon = await getIcon(
            "LuMapPinned",
            "lu",
            false,
            m.name,
            undefined,
            {
              iconColor: "white",
              borderColor: COLORS.textColorMedium,
              iconBgColor: COLORS.textColorMedium,
              containerWidth: 125,
            }
          );

          function microPocketClickHandler(position: MapModalGeoPosition) {
            setModalContent(
              {
                title: m.name,
                content: m.description || "",
                titleIcon: (
                  <DynamicReactIcon
                    iconName="LuMapPinned"
                    iconSet="lu"
                    size={20}
                    color={COLORS.textColorDark}
                  />
                ),
                tags: [
                  {
                    label: "Micro pocket",
                    color: COLORS.textColorMedium,
                  },
                ],
              },
              position,
            );
            setInfoModalOpen(true);
          }

          return (
            <>
              <Marker
                key={`micro-pocket-${m._id}`}
                icon={MicroPocketIcon!}
                zIndexOffset={100}
                position={[m.location.lat, m.location.lng]}
                eventHandlers={{
                  click: () =>
                    microPocketClickHandler({ lat: m.location.lat, lng: m.location.lng }),
                }}
              />
              {m.geoJson ? (
                <Polygon
                  key={`mp-${m.name.toLowerCase().replaceAll(" ", "-")}`}
                  positions={m.geoJson.features[0].geometry.coordinates.map(
                    ([lng, lat]: [number, number]) =>
                      [lat, lng] as [number, number]
                  )}
                  eventHandlers={{
                    click: (e) =>
                      microPocketClickHandler({ lat: e.latlng.lat, lng: e.latlng.lng }),
                  }}
                  pathOptions={{
                    color: COLORS.textColorMedium,
                    weight: 1,
                    fillOpacity: 0.1,
                    fillColor: COLORS.textColorMedium,
                  }}
                />
              ) : null}
            </>
          );
        })
      );

      setMicroPocketElements(elements);
    };

    renderMicroPocketElements();
  }, [microPockets, setModalContent, setInfoModalOpen]);

  if (!microPockets || !isBelowMicroPocketZoom) {
    return null;
  }

  return <>{microPocketElements || null}</>;
};
