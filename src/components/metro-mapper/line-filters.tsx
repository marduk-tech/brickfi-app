import { Button, Flex, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";

interface LineInfo {
  name: string;
  strokeColor?: string;
}

interface LineFiltersProps {
  transitDrivers: IDriverPlace[];
  selectedLines: string[];
  onLineToggle: (lineName: string) => void;
  onClearFilters: () => void;
}

export const LineFilters: React.FC<LineFiltersProps> = ({
  transitDrivers,
  selectedLines,
  onLineToggle,
  onClearFilters,
}) => {
  const { isMobile } = useDevice();
  // unique line names with stroke colors from transit drivers
  const getUniqueLines = (): LineInfo[] => {
    const lineMap = new Map<string, string>();

    transitDrivers.forEach((driver) => {
      if (driver.name && driver.name.trim() !== "") {
        // Find the first LineString feature to get stroke color
        const lineStringFeature = (driver.features as any)?.find?.(
          (feature: any) => feature.geometry?.type === "LineString"
        );

        const strokeColor = lineStringFeature?.properties?.strokeColor;
        lineMap.set(driver.name, strokeColor);
      }
    });

    return Array.from(lineMap.entries()).map(([name, strokeColor]) => ({
      name,
      strokeColor,
    }));
  };

  const uniqueLines = getUniqueLines();

  if (uniqueLines.length === 0) {
    return null;
  }

  const getLineIcon = (lineName: string) => {
    const lowerName = lineName.toLowerCase();
    if (lowerName.includes("namma metro")) {
      return (
        <img
          src="/images/metro-mapper/namma-metro-logo.png"
          alt="Namma Metro"
          style={{ width: 14, height: 14 }}
        />
      );
    } else if (lowerName.includes("suburban rail")) {
      return (
        <img
          src="/images/metro-mapper/kride-logo.png"
          alt="Suburban Rail"
          style={{ width: 14, height: 14 }}
        />
      );
    }
    return (
      <DynamicReactIcon
        iconName="MdOutlineDirectionsTransit"
        iconSet="md"
        size={14}
        color={selectedLines.includes(lineName) ? "white" : COLORS.primaryColor}
      />
    );
  };

  return (
    <Flex
      vertical
      style={{
        padding: "16px 0",
        width: "100%",
        minWidth: 0,
      }}
    >
      <div className={isMobile ? "" : "scrollbar-wrapper"}>
        <div
          className="custom-scrollbar"
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            scrollbarWidth: "none", // scrollbar on desktop, hide on mobile
            WebkitOverflowScrolling: "touch",
            width: "100%",
            minWidth: 0,
          }}
        >
          {uniqueLines.map((lineInfo) => {
            const isSelected = selectedLines.includes(lineInfo.name);

            return (
              <Button
                key={lineInfo.name}
                size="small"
                onClick={() => onLineToggle(lineInfo.name)}
                style={{
                  borderRadius: 20,
                  height: 32,
                  paddingLeft: 8,
                  paddingRight: 8,
                  backgroundColor: isSelected ? COLORS.primaryColor : "white",
                  borderColor: isSelected
                    ? COLORS.primaryColor
                    : lineInfo.strokeColor || COLORS.borderColor,
                  color: isSelected ? "white" : COLORS.textColorDark,
                  fontSize: FONT_SIZE.SUB_TEXT,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  borderWidth: 2,
                  gap: 6,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
                icon={getLineIcon(lineInfo.name)}
              >
                {lineInfo.name}
              </Button>
            );
          })}
        </div>
      </div>
      <Flex align="center" style={{ marginTop: 8 }} gap={16}>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.PARA,
            color: COLORS.textColorMedium,
          }}
        >
          {selectedLines.length > 0
            ? `Showing ${selectedLines.length} selected line${
                selectedLines.length !== 1 ? "s" : ""
              }`
            : ""}
        </Typography.Text>

        {selectedLines.length > 0 && (
          <Button
            size="small"
            onClick={onClearFilters}
            style={{
              color: COLORS.primaryColor,
              fontSize: FONT_SIZE.SUB_TEXT * 0.8,
              padding: "2px 4px",
              height: "auto",
              borderRadius: 16,
            }}
          >
            Clear All
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
