import React, { useEffect, useState } from "react";
import { Marker, Polygon } from "react-leaflet";
import { COLORS } from "../../../theme/style-constants";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";
import { getIcon } from "../utils";
import DynamicReactIcon from "../../common/dynamic-react-icon";

interface CorridorMarkersProps {
  corridors?: any[];
  setModalContent: (content: MapModalContent, position?: MapModalGeoPosition) => void;
  setInfoModalOpen: (open: boolean) => void;
}

export const CorridorMarkers = ({
  corridors,
  setModalContent,
  setInfoModalOpen,
}: CorridorMarkersProps) => {
  const [corridorsElements, setCorridorElements] =
    useState<React.ReactNode[]>();

  useEffect(() => {
    if (!corridors) {
      return;
    }

    const renderCorridorElements = async () => {
      const elements = await Promise.all(
        corridors.map(async (c) => {
          const CorridorIcon = await getIcon(
            "LuMilestone",
            "lu",
            false,
            c.name,
            undefined,
            {
              iconColor: "white",
              borderColor: COLORS.bgColorDark,
              iconBgColor: COLORS.bgColorDark,
              containerWidth: 125,
            }
          );

          function corridorClickHandler(position: MapModalGeoPosition) {
            setModalContent(
              {
                title: c.name,
                content: c.description || "",
                titleIcon: (
                  <DynamicReactIcon
                    iconName="LuMilestone"
                    iconSet="lu"
                    size={20}
                    color={COLORS.textColorDark}
                  />
                ),
                tags: [
                  {
                    label: "Growth corridor",
                    color: COLORS.textColorDark,
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
                key={`corridor-${c._id}`}
                icon={CorridorIcon!}
                zIndexOffset={100}
                position={[c.location.lat, c.location.lng]}
                eventHandlers={{
                  click: () =>
                    corridorClickHandler({ lat: c.location.lat, lng: c.location.lng }),
                }}
              />
              {c.geoJson ? (
                <Polygon
                  key={`corr-${c.name.toLowerCase().replaceAll(" ", "-")}`}
                  positions={c.geoJson.features[0].geometry.coordinates.map(
                    ([lng, lat]: [number, number]) =>
                      [lat, lng] as [number, number]
                  )}
                  eventHandlers={{
                    click: (e) =>
                      corridorClickHandler({ lat: e.latlng.lat, lng: e.latlng.lng }),
                  }}
                  pathOptions={{
                    color: COLORS.textColorMedium,
                    weight: 1,
                    fillOpacity: 0.1,
                    fillColor: COLORS.textColorDark,
                  }}
                />
              ) : null}
            </>
          );
        })
      );

      setCorridorElements(elements);
    };

    renderCorridorElements();
  }, [corridors, setModalContent, setInfoModalOpen]);

  if (!corridors) {
    return null;
  }

  return <>{corridorsElements || null}</>;
};
