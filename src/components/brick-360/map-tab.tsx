import { Button, Flex, Modal } from "antd";
import { useEffect, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import { DRIVER_CATEGORIES } from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import MapViewV2 from "../map-view/map-view-v2";
import { ScrollableContainer } from "../scrollable-container";

interface MapTabProps {
  lvnzyProject: any;
}

export const MapTab = ({ lvnzyProject }: MapTabProps) => {
  const { isMobile } = useDevice();
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
          height: window.innerHeight - 350,
          paddingBottom: 40,
        }}
        vertical
        gap={8}
      >
        {!isMapFullScreen && (
          <Flex
            style={{
              position: "absolute",
              top: 66,
              right: 16,
              zIndex: 9999,
            }}
          >
            <Button
              size="small"
              icon={
                <DynamicReactIcon
                  iconName="FaExpand"
                  color="white"
                  iconSet="fa"
                  size={16}
                />
              }
              style={{
                marginLeft: "auto",
                marginBottom: 8,
                borderRadius: 8,
                cursor: "pointer",
                backgroundColor: COLORS.textColorDark,
                color: "white",
                fontSize: FONT_SIZE.HEADING_4,
                height: 28,
              }}
              onClick={() => {
                setIsMapFullScreen(true);
              }}
            >
              Expand
            </Button>
          </Flex>
        )}

        {!isMapFullScreen && (
          <MapViewV2
            fullSize={false}
            projectId={lvnzyProject?.originalProjectId._id}
            drivers={drivers}
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
              height: Math.min(window.innerHeight - 75, 800),
              paddingTop: 28,
            }}
            vertical
            gap={16}
          >
            <MapViewV2
              projectId={lvnzyProject?.originalProjectId._id}
              drivers={drivers}
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
