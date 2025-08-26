import { Flex, Spin, Typography } from "antd";
import { useNearestStations } from "../../hooks/use-nearest-stations";
import { SearchResult } from "../../hooks/use-place-search";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";

// helper function to get icon based on driver type
const getDriverIcon = (driverType: string) => {
  const iconMap: Record<
    string,
    { iconName: string; iconSet: string; color: string }
  > = {
    transit: {
      iconName: "MdOutlineDirectionsTransit",
      iconSet: "md",
      color: "#1890ff",
    },
    school: { iconName: "IoSchool", iconSet: "io5", color: "#52c41a" },
    hospital: { iconName: "FaHospital", iconSet: "fa", color: "#f5222d" },
    commercial: { iconName: "MdBusiness", iconSet: "md", color: "#722ed1" },
    food: { iconName: "IoRestaurant", iconSet: "io5", color: "#fa8c16" },
    highway: { iconName: "FaRoad", iconSet: "fa", color: "#13c2c2" },
    lake: { iconName: "IoWater", iconSet: "io5", color: "#1890ff" },
    "industrial-hitech": {
      iconName: "MdFactory",
      iconSet: "md",
      color: "#eb2f96",
    },
    default: { iconName: "IoLocationSharp", iconSet: "io5", color: "#595959" },
  };

  return iconMap[driverType] || iconMap.default;
};

interface NearestStationsDisplayProps {
  selectedResult?: SearchResult | null;
}

export const NearestStationsDisplay: React.FC<NearestStationsDisplayProps> = ({
  selectedResult,
}) => {
  const {
    data: stationsData,
    isLoading,
    error,
  } = useNearestStations(
    selectedResult?.coordinates[0],
    selectedResult?.coordinates[1]
  );

  if (!selectedResult) return null;

  if (isLoading) {
    return (
      <Flex
        style={{
          padding: "16px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          backgroundColor: COLORS.bgColorMedium,
        }}
        align="center"
        justify="center"
        gap={8}
      >
        <Spin size="small" />
        <Typography.Text style={{ color: COLORS.textColorLight }}>
          Finding nearest places...
        </Typography.Text>
      </Flex>
    );
  }

  if (error || !stationsData || stationsData.nearestStations.length === 0) {
    return (
      <Flex
        style={{
          padding: "16px",
          borderTop: `1px solid ${COLORS.borderColor}`,
          backgroundColor: COLORS.bgColorMedium,
        }}
        align="center"
        justify="center"
      >
        <Typography.Text style={{ color: COLORS.textColorLight }}>
          No nearby places found
        </Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex
      vertical
      style={{
        borderTop: `1px solid ${COLORS.borderColor}`,
        backgroundColor: "white",
      }}
    >
      {/* Header */}
      <Flex
        style={{
          padding: "12px 16px",
          backgroundColor: COLORS.bgColorMedium,
          borderBottom: `1px solid ${COLORS.borderColor}`,
        }}
        align="center"
        gap={8}
      >
        <DynamicReactIcon
          iconName="MdOutlineDirectionsTransit"
          iconSet="md"
          size={16}
          color={COLORS.textColorDark}
        />
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorDark,
            fontWeight: 500,
          }}
        >
          Nearest Places
        </Typography.Text>
      </Flex>

      {/* Places List */}
      <Flex vertical style={{ maxHeight: "200px", overflowY: "auto" }}>
        {stationsData.nearestStations.map((station) => {
          const driverIcon = getDriverIcon(station.driverName);

          return (
            <Flex
              key={station.stationId}
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${COLORS.borderColor}`,
              }}
              gap={12}
              align="start"
            >
              {/* Dynamic Icon based on driver type */}
              <Flex
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  backgroundColor: driverIcon.color,
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                <DynamicReactIcon
                  iconName={driverIcon.iconName}
                  iconSet={driverIcon.iconSet as any}
                  size={16}
                  color="white"
                />
              </Flex>

              {/* Place Details */}
              <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    fontWeight: 500,
                    color: COLORS.textColorDark,
                    marginBottom: 4,
                  }}
                  ellipsis={{ tooltip: station.stationName }}
                >
                  {station.stationName}
                </Typography.Text>

                <Flex gap={12}>
                  <Flex align="center" gap={4}>
                    <DynamicReactIcon
                      iconName="IoLocation"
                      iconSet="io5"
                      size={12}
                      color={COLORS.textColorLight}
                    />
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                      }}
                    >
                      {station.distance} km
                    </Typography.Text>
                  </Flex>

                  <Flex align="center" gap={4}>
                    <DynamicReactIcon
                      iconName="IoTime"
                      iconSet="io5"
                      size={12}
                      color={COLORS.textColorLight}
                    />
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                      }}
                    >
                      {station.travelTime} mins
                    </Typography.Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
