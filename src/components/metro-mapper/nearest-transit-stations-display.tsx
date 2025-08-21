import { Flex, Modal, Spin, Typography } from "antd";
import { ReactNode, useEffect, useState } from "react";
import { useDevice } from "../../hooks/use-device";
import {
  NearestTransitStation,
  useNearestTransitStations,
} from "../../hooks/use-nearest-transit-stations";
import { SearchResult } from "../../hooks/use-place-search";
import { PLACE_TIMELINE } from "../../libs/constants";
import { renderCitations } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IDriverPlace } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";
const { Paragraph } = Typography;

interface NearestTransitStationsDisplayProps {
  selectedResult?: SearchResult | null;
  transitDrivers: IDriverPlace[];
  onFetchedTransitDrivers: (transitDrivers: NearestTransitStation[]) => void;
}

export const NearestTransitStationsDisplay: React.FC<
  NearestTransitStationsDisplayProps
> = ({ selectedResult, transitDrivers, onFetchedTransitDrivers }) => {
  const { isMobile } = useDevice();
  const [mobileDetailsDialogContent, setMobileDetailsDialogContent] =
    useState<ReactNode>();

  const {
    data: transitStationsData,
    isLoading,
    error,
  } = useNearestTransitStations(
    selectedResult?.coordinates[0],
    selectedResult?.coordinates[1]
  );

  const [nearestUniqueStations, setNearestUniqueStations] = useState<
    NearestTransitStation[]
  >([]);

  useEffect(() => {
    if (
      transitStationsData &&
      transitStationsData.nearestStations &&
      Array.isArray(transitStationsData.nearestStations) &&
      transitStationsData.nearestStations.length > 0
    ) {
      try {
        const nearestStationsSortedByDuration =
          transitStationsData.nearestStations
            .filter((station) => {
              return (
                station &&
                (station as any).stationName &&
                (station as any).driverId &&
                station.travelTime != null
              );
            })
            .sort((a, b) => a.travelTime - b.travelTime);

        const driverForWhichStationsAdded: string[] = [];
        const uniqueStations: NearestTransitStation[] = [];

        nearestStationsSortedByDuration.forEach((station) => {
          // Extract driverId from stationId (format: driverId_stationNumber)
          const stationDriverId = station.driverId;
          if (
            stationDriverId &&
            !driverForWhichStationsAdded.includes(stationDriverId)
          ) {
            driverForWhichStationsAdded.push(stationDriverId);
            uniqueStations.push({
              driverId: stationDriverId, // Use extracted driverId
              stationName: (station as any).stationName,
              distance: (station as any).distance,
              travelTime: station.travelTime,
            });
          }
        });

        setNearestUniqueStations(uniqueStations);
        onFetchedTransitDrivers(uniqueStations);
      } catch (error) {
        console.error("Error processing nearest transit stations:", error);
        setNearestUniqueStations([]);
        onFetchedTransitDrivers([]);
      }
    } else {
      setNearestUniqueStations([]);
      onFetchedTransitDrivers([]);
    }
  }, [transitStationsData, onFetchedTransitDrivers, transitDrivers]);

  if (!selectedResult) return null;

  if (isLoading) {
    return (
      <Flex
        align="center"
        justify="center"
        gap={8}
        style={{
          padding: "24px",
        }}
      >
        <Spin size="small" />
        <Typography.Text style={{ color: COLORS.textColorLight }}>
          Finding nearest transit stations...
        </Typography.Text>
      </Flex>
    );
  }

  if (
    error ||
    !transitStationsData ||
    !transitStationsData.nearestStations ||
    transitStationsData.nearestStations.length === 0
  ) {
    return (
      <Flex
        style={{
          marginTop: 16,
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Flex align="center" justify="center" style={{ padding: "24px" }}>
          <Typography.Text style={{ color: COLORS.textColorLight }}>
            No nearby transit stations found
          </Typography.Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex vertical style={{ overflow: "hidden" }}>
      <Typography.Text
        style={{
          padding: isMobile ? "8px 16px" : "8px 24px",
          fontSize: FONT_SIZE.HEADING_2,
          color: COLORS.textColorMedium,
        }}
      >
        {nearestUniqueStations.length} stations found
      </Typography.Text>

      <Flex
        vertical={!isMobile}
        style={{
          margin: "0 16px",
          maxHeight: 500,
          overflowY: isMobile ? "hidden" : "scroll",
          overflowX: isMobile ? "scroll" : "hidden",
          scrollbarWidth: "none",
          width: "100%",
        }}
        gap={8}
      >
        {nearestUniqueStations.map((station, index) => {
          const transitDriver = transitDrivers.find(
            (t) => t._id === station.driverId
          );
          if (!transitDriver) {
            return null;
          }
          let driverColor;
          try {
            driverColor = transitDriver.features.find(
              (f: any) => f.geometry.type == "LineString"
            ).properties.strokeColor;
          } catch (err) {
            console.log(err);
          }
          return (
            <Flex
              key={`${station.driverId}-${index}`}
              vertical
              style={{
                width: isMobile ? window.innerWidth - 100 : "100%",
                padding: "8px",
                paddingBottom: 16,
                margin: "0 0 8px 0",
                borderBottom: isMobile
                  ? "none"
                  : `1px solid ${COLORS.borderColor}`,
                border: !isMobile ? "none" : `1px solid ${COLORS.borderColor}`,
                borderRadius: isMobile ? 8 : 0,
                paddingLeft: 8,
                height: "auto",
                flexShrink: 0,
                marginRight: isMobile
                  ? index == nearestUniqueStations.length - 1
                    ? 32
                    : 4
                  : 0,
                marginBottom: !isMobile
                  ? index == nearestUniqueStations.length - 1
                    ? 200
                    : 4
                  : 0,
              }}
              align="start"
            >
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  color: driverColor || COLORS.borderColor,
                  textTransform: "uppercase",
                }}
                ellipsis={{ tooltip: station.stationName }}
              >
                STATION: {station.stationName}
              </Typography.Text>

              {/* Station Name */}
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_3,
                  color: COLORS.textColorDark,
                  fontWeight: 500,
                }}
                ellipsis={{ tooltip: transitDriver.name }}
              >
                {transitDriver.name}
              </Typography.Text>

              <Flex
                gap={16}
                style={{ marginTop: 4, marginBottom: 8 }}
                align="center"
              >
                <Flex align="center" gap={2}>
                  <DynamicReactIcon
                    iconName="IoTime"
                    iconSet="io5"
                    size={14}
                    color={COLORS.textColorDark}
                  />
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.PARA,
                      color: COLORS.textColorDark,
                      fontWeight: 500,
                    }}
                  >
                    {station.travelTime} mins ({station.distance} km)
                  </Typography.Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <DynamicReactIcon
                    iconName={
                      transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                        ? "BiSolidBoltCircle"
                        : "TbProgressBolt"
                    }
                    iconSet={
                      transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                        ? "bi"
                        : "tb"
                    }
                    size={18}
                    color={
                      transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                        ? COLORS.greenIdentifier
                        : COLORS.yellowIdentifier
                    }
                  />
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.PARA,
                      color: COLORS.textColorDark,
                      fontWeight: 500,
                    }}
                  >
                    {transitDriver.status == PLACE_TIMELINE.POST_LAUNCH
                      ? "Operational"
                      : "Under Construction"}
                  </Typography.Text>
                </Flex>
              </Flex>

              {isMobile ? (
                <Typography.Text
                  onClick={() => {
                    setMobileDetailsDialogContent(
                      <Flex vertical>
                        <Typography.Text
                          style={{
                            fontSize: FONT_SIZE.HEADING_2,
                            fontWeight: 500,
                            marginBottom: 16,
                          }}
                        >
                          {transitDriver.name}
                        </Typography.Text>
                        {transitDriver.details?.info?.intro}
                        <br></br>
                        {transitDriver.details?.info?.timeline}
                        <br></br>
                        <br></br>
                        <Flex
                          style={{
                            width: "100%",
                            overflowX: "scroll",
                            scrollbarWidth: "none",
                          }}
                        >
                          <Flex
                            style={{
                              whiteSpace: "nowrap",
                            }}
                          >
                            {renderCitations(
                              transitDriver.details?.info?.citations
                            )}
                          </Flex>
                        </Flex>
                      </Flex>
                    );
                  }}
                  style={{ color: COLORS.primaryColor, marginTop: 8 }}
                >
                  See Details/Timeline
                </Typography.Text>
              ) : (
                <Flex vertical style={{ width: "100%" }}>
                  <Typography.Text
                    style={{
                      fontWeight: 500,
                      fontSize: FONT_SIZE.PARA,
                      color: COLORS.textColorMedium,
                      margin: 0,
                    }}
                  >
                    Details & Timeline
                  </Typography.Text>
                  <Paragraph
                    style={{ fontSize: FONT_SIZE.SUB_TEXT, margin: 0 }}
                    ellipsis={{
                      rows: 2,
                      expandable: true,
                      symbol: "more",
                    }}
                  >
                    {transitDriver.details?.info?.intro}
                    <br></br>
                    {transitDriver.details?.info?.timeline}
                    <br></br>
                    <br></br>
                    <Flex
                      style={{
                        width: "100%",
                        overflowX: "scroll",
                        scrollbarWidth: "none",
                      }}
                    >
                      <Flex
                        style={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        {renderCitations(
                          transitDriver.details?.info?.citations
                        )}
                      </Flex>
                    </Flex>
                  </Paragraph>
                </Flex>
              )}
            </Flex>
          );
        })}
      </Flex>
      <Modal
        open={!!mobileDetailsDialogContent}
        closable={true}
        footer={null}
        onCancel={() => {
          setMobileDetailsDialogContent(undefined);
        }}
        onClose={() => {
          setMobileDetailsDialogContent(undefined);
        }}
      >
        <Flex vertical>{mobileDetailsDialogContent}</Flex>
      </Modal>
    </Flex>
  );
};
