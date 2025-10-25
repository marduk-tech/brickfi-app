import { Button, Flex, Modal } from "antd";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { useDevice } from "../../hooks/use-device";
import { DRIVER_CATEGORIES } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
const MapViewV2 = dynamic(() => import("../map-view-v2/map-view-v2"), {
  ssr: false,
});

import { ScrollableContainer } from "../scrollable-container";
import { MapExpandBtn } from "../map-view-v2/map-utils/map-expand-btn";

interface MapTabProps {
  lvnzyProject: any;
}

export const MapTab = ({ lvnzyProject }: MapTabProps) => {
  const { isMobile } = useDevice();
  const { height } = useWindowDimensions();
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [surroundingElements, setSurroundingElements] = useState<any[]>([]);

  // Get all available categories from DRIVER_CATEGORIES
  const allCategories = Object.keys(DRIVER_CATEGORIES);

  useEffect(() => {
    if (!lvnzyProject) {
      return;
    }
    setDrivers(
      [
        ...lvnzyProject.connectivity.drivers,
        ...lvnzyProject.neighborhood.drivers,
      ].map((d) => {
        return {
          ...d.driverId,
          distance: d.distanceKms,
          duration: d.durationMins
            ? d.durationMins
            : Math.round(d.mapsDurationSeconds / 60),
        };
      })
    );

    if (lvnzyProject.property?.surroundings) {
      setSurroundingElements(lvnzyProject.property.surroundings);
    }
  }, [lvnzyProject]);

  return (
    <ScrollableContainer>
      <Flex
        style={{
          position: "relative",
          height: height - 250,
          paddingBottom: 40,
        }}
        vertical
        gap={8}
      >
        {!isMapFullScreen && (
          <MapExpandBtn
            onClick={() => {
              setIsMapFullScreen(true);
            }}
          ></MapExpandBtn>
        )}

        {!isMapFullScreen && (
          <MapViewV2
            fullSize={false}
            projectId={lvnzyProject?.originalProjectId._id}
            drivers={drivers}
            corridorIds={lvnzyProject?.originalProjectId?.info.corridors.map((c: any) => c.corridorId)}
            surroundingElements={surroundingElements}
            categories={allCategories}
          />
        )}

        <Modal
          title={null}
          open={isMapFullScreen}
          onCancel={() => {
            setIsMapFullScreen(false);
          }}
          mask={true}
          forceRender
          footer={null}
          width={isMobile ? "100%" : 900}
          style={{ top: 10 }}
          closeIcon={
            <DynamicReactIcon
              iconName="IoCloseCircle"
              iconSet="io5"
              size={32}
              color={COLORS.textColorMedium}
            ></DynamicReactIcon>
          }
          styles={{
            content: {
              backgroundColor: COLORS.bgColor,
              borderRadius: 8,
              padding: 16,
              overflowY: "hidden",
            },
          }}
        >
          <Flex
            style={{
              height: Math.min(height - 75, 800),
              paddingTop: 28,
            }}
            vertical
            gap={16}
          >
            <MapViewV2
              projectId={lvnzyProject?.originalProjectId._id}
              drivers={drivers}
              corridorIds={lvnzyProject?.originalProjectId?.info.corridors.map((c: any) => c.corridorId)}
              surroundingElements={surroundingElements}
              fullSize={true}
              categories={allCategories}
            />
          </Flex>
        </Modal>
      </Flex>
    </ScrollableContainer>
  );
};
