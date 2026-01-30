import { useEffect, useState } from "react";
import { Polygon, Popup, useMap } from "react-leaflet";
import { CATEGORY_COLORS, DRIVER_TYPE_COLORS } from "../../libs/constants";
import { COLORS } from "../../theme/style-constants";

export interface PolygonData {
  id: string;
  driverId?: string;
  sectionIndex?: number;
  positions: [number, number][];
  name: string;
  description: string;
  driverType?: string;
  category?: string;
}

const getPolygonColor = (polygon: PolygonData): string => {
  if (polygon.id === "primary-project") {
    return COLORS.textColorDark;
  }

  // prioritize driver type color (more specific)
  if (polygon.driverType && DRIVER_TYPE_COLORS[polygon.driverType]) {
    return DRIVER_TYPE_COLORS[polygon.driverType];
  }

  // fall back to category color
  if (polygon.category && CATEGORY_COLORS[polygon.category]) {
    return CATEGORY_COLORS[polygon.category];
  }

  // default to red for backward compatibility
  return COLORS.redIdentifier;
};

export const MapPolygons = ({ polygons }: { polygons: PolygonData[] }) => {
  const map = useMap();
  const [visiblePolygons, setVisiblePolygons] = useState<typeof polygons>([]);

  const updateVisiblePolygons = () => {
    const zoom = map.getZoom();
    const bounds = map.getBounds();

    // Show polygons if zoom >= 14 or if any is a project-bounds type
    if (zoom >= 14 || polygons.some((p) => p.id === "primary-project")) {
      setVisiblePolygons(
        polygons.filter((polygon) =>
          polygon.positions.some((pos) => bounds.contains(pos)),
        ),
      );
    } else {
      setVisiblePolygons([]);
    }
  };

  useEffect(() => {
    // Clear polygons if input array is empty
    if (!polygons || !polygons.length) {
      setVisiblePolygons([]);
      return;
    }

    updateVisiblePolygons();

    const handleZoomEnd = () => {
      updateVisiblePolygons();
    };

    const handleMoveEnd = () => {
      updateVisiblePolygons();
    };

    map.on("zoomend", handleZoomEnd);
    map.on("moveend", handleMoveEnd);

    return () => {
      map.off("zoomend", handleZoomEnd);
      map.off("moveend", handleMoveEnd);
    };
  }, [map, polygons]);

  return (
    <>
      {visiblePolygons.map((poly) => (
        <Polygon
          key={`polygon-${poly.id}`}
          positions={poly.positions}
          pathOptions={{
            color: getPolygonColor(poly),
            weight: 3,
            fillOpacity: 0.4,
            fillColor: getPolygonColor(poly),
          }}
        >
          <Popup>
            <div style={{ maxWidth: "200px" }}>
              <strong>{poly.name}</strong>
              {poly.sectionIndex !== undefined && (
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  Section {poly.sectionIndex + 1}
                </div>
              )}
              {poly.description && (
                <div style={{ fontSize: "12px", marginTop: "4px" }}>
                  {poly.description}
                </div>
              )}
            </div>
          </Popup>
        </Polygon>
      ))}
    </>
  );
};
