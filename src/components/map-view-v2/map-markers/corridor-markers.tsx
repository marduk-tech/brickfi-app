import React, { useEffect, useState } from "react";
import { Marker } from "react-leaflet";
import { COLORS } from "../../../theme/style-constants";
import { MapModalContent } from "../map-modal";
import { getIcon } from "../utils";
import DynamicReactIcon from "../../common/dynamic-react-icon";

interface CorridorMarkersProps {
  corridors?: any[];
  setModalContent: (content: MapModalContent) => void;
  setInfoModalOpen: (open: boolean) => void;
}

export const CorridorMarkers = ({
  corridors,
  setModalContent,
  setInfoModalOpen,
}: CorridorMarkersProps) => {
  const [corridorsElements, setCorridorElements] = useState<React.ReactNode[]>();

  useEffect(() => {
    if (!corridors) {
      return;
    }
    
    const loadIcons = async () => {
      const elements = await Promise.all(
        corridors.map(async (c) => {
          const CorridorIcon = await getIcon(
            "LuMilestone",
            "lu",
            false,
            c.name,
            undefined,
            {
              iconColor: COLORS.textColorDark,
              borderColor: COLORS.textColorMedium,
              iconBgColor: COLORS.bgColorMedium,
              containerWidth: 125,
            }
          );

          return (
            <Marker
              key={`corridor-${c._id}`}
              icon={CorridorIcon!}
              zIndexOffset={100}
              position={[c.location.lat, c.location.lng]}
              eventHandlers={{
                click: () => {
                  setModalContent({
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
                  });
                  setInfoModalOpen(true);
                },
              }}
            />
          );
        })
      );

      setCorridorElements(elements);
    };

    loadIcons();
  }, [corridors, setModalContent, setInfoModalOpen]);

  if (!corridors) {
    return null;
  }

  return <>{corridorsElements || null}</>;
};