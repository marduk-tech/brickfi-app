import { useMap } from "@vis.gl/react-google-maps";
import { Flex, Modal, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { PLACE_TIMELINE } from "../../../libs/constants";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";

const { Paragraph } = Typography;

interface LatLng {
  lat: number;
  lng: number;
}

interface LineFeature {
  name: string;
  coordinates: LatLng[];
  strokeColor: string;
  strokeOpacity: number;
  strokeWeight: number;
  dashConfig?: {
    spacing: number;
  };
}

interface PointFeature {
  name: string;
  coordinates: LatLng;
  color: string;
}

export const ConnectivityInfra: React.FC<any> = ({ connectivityData }) => {
  const map = useMap();
  const [lines, setLines] = useState<LineFeature[]>([]);

  const [selectedLine, setSelectedLine] = useState<LineFeature | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [points, setPoints] = useState<PointFeature[]>([]);

  useEffect(() => {
    const extractedLines: LineFeature[] =
      (connectivityData?.features
        .map((feature: any) => {
          const featureName =
            connectivityData.features.length > 1
              ? feature.properties.name || connectivityData.name
              : connectivityData.name;

          let customProps = {};

          const status =
            connectivityData.features.length == 1
              ? connectivityData.status
              : feature.properties.status || connectivityData.status;
          if (
            status &&
            ![
              PLACE_TIMELINE.LAUNCHED,
              PLACE_TIMELINE.POST_LAUNCH,
              PLACE_TIMELINE.PARTIAL_LAUNCH,
            ].includes(status)
          ) {
            customProps = {
              dashConfig: {
                spacing: 15,
              },
            };
          }

          if (feature.geometry.type === "LineString") {
            const coordinates: LatLng[] = feature.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => ({ lat, lng })
            );

            return {
              name: featureName,
              coordinates: [coordinates],
              strokeColor:
                feature.properties.strokeColor || COLORS.textColorDark,
              strokeWeight: 4,
              ...customProps,
            };
          } else if (feature.geometry.type === "MultiLineString") {
            const coordinates: LatLng[][] = feature.geometry.coordinates.map(
              (line: [number, number, number][]) =>
                line.map(([lng, lat]: [number, number, number]) => ({
                  lat,
                  lng,
                }))
            );
            return {
              name: featureName,
              coordinates,
              strokeColor:
                feature.properties.strokeColor || COLORS.textColorDark,
              strokeWeight: 4,
              ...customProps,
            };
          }
          return null;
        })
        .filter(Boolean) as LineFeature[]) || [];

    // Extract points
    const extractedPoints: PointFeature[] = connectivityData?.features
      .map((feature: any) => {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates as [number, number];
          return {
            name: feature.properties.name || connectivityData.name,
            coordinates: { lat, lng },
            color: feature.properties.color || COLORS.textColorDark,
          };
        }
        return null;
      })
      .filter(Boolean) as PointFeature[];

    setLines(extractedLines);
    setPoints(extractedPoints);
  }, []);

  useEffect(() => {
    if (!map) return;

    const mapListeners = [
      map.addListener("click", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
      map.addListener("dragstart", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
      map.addListener("zoom_changed", () => {
        setSelectedLine(null);
        setPopupPosition(null);
      }),
    ];

    const polylineObjects = lines.flatMap((line) =>
      line.coordinates.map((coords) => {
        let polyline;
        if (line.dashConfig) {
          polyline = new google.maps.Polyline({
            path: coords as any,
            strokeOpacity: 0,
            map: map,
            icons: [
              {
                icon: {
                  path: "M 0,-1 0,1",
                  strokeOpacity: 1,
                  strokeColor: line.strokeColor,
                  scale: 4,
                },
                offset: "0",
                repeat: `${line.dashConfig.spacing}px`, // Length of dashes
              },
            ],
          });
        } else {
          polyline = new google.maps.Polyline({
            path: coords as any,
            strokeColor: line.strokeColor,
            strokeOpacity: line.strokeOpacity,
            strokeWeight: line.strokeWeight,
            map: map,
          });
        }

        polyline.addListener("click", (e: any) => {
          e.stop();
          setSelectedLine(line);

          setPopupPosition({
            x: e.domEvent.clientX,
            y: e.domEvent.clientY,
          });
        });

        return polyline;
      })
    );

    const pointObjects = points.map((point) => {
      const circle = new google.maps.Circle({
        center: point.coordinates,
        radius: 100,
        strokeColor: "#000000",
        strokeWeight: 1,
        fillColor: "white",
        fillOpacity: 1,
        map: map,
        zIndex: 99,
      });

      // circle.addListener("click", (e: any) => {
      //   e.stop();
      //     x: e.domEvent.clientX,
      //     y: e.domEvent.clientY,
      //   });
      // });

      return circle;
    });

    // Cleanup when unmounting
    return () => {
      polylineObjects.forEach((polyline) => {
        google.maps.event.clearListeners(polyline, "click");
        polyline.setMap(null);
      });
      pointObjects.forEach((point) => {
        google.maps.event.clearListeners(point, "click");
        point.setMap(null);
      });
      mapListeners.forEach((listener) =>
        google.maps.event.removeListener(listener)
      );
    };
  }, [map, lines, points]);

  useEffect(() => {
    const handleScroll = () => {
      setSelectedLine(null);
      setPopupPosition(null);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Modal
      title={connectivityData.name}
      open={!!(selectedLine && selectedLine.name)}
      style={{ padding: 0 }}
      footer={null}
      onCancel={() => {
        setSelectedLine(null);
      }}
    >
      {selectedLine && selectedLine.name ? (
        <div>
          <Flex style={{ marginBottom: "8px", marginTop: "8px" }} wrap="wrap">
            {connectivityData?.features.length > 1 ? (
              <Tag
                color="blue"
                key={selectedLine.name}
                style={{
                  marginRight: "4px",
                  marginBottom: "4px",
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                {selectedLine.name}
              </Tag>
            ) : null}
            <Tag
              color={
                selectedLine.dashConfig
                  ? COLORS.yellowIdentifier
                  : COLORS.greenIdentifier
              }
              style={{
                marginRight: "4px",
                marginBottom: "4px",
                fontSize: FONT_SIZE.SUB_TEXT,
              }}
            >
              {selectedLine.dashConfig ? "Under Construction" : "Operational"}
            </Tag>
          </Flex>
          {connectivityData.details && connectivityData.details.oneLiner ? (
            <Paragraph
              style={{
                fontSize: FONT_SIZE.PARA,
              }}
              ellipsis={{ rows: 5, expandable: true, symbol: "more" }}
            >
              {connectivityData?.details.oneLiner}
            </Paragraph>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
};
