import { useEffect, useState } from "react";
import { Polygon, Popup, useMap } from "react-leaflet";
import { COLORS } from "../../theme/style-constants";

export interface PolygonData {
  id: string;
  driverId?: string;
  sectionIndex?: number;
  positions: [number, number][];
  name: string;
  description: string;
}

export const MapPolygons = ({
  polygons,
}: {
  polygons: PolygonData[];
}) => {
  const map = useMap();
  const [visiblePolygons, setVisiblePolygons] = useState<typeof polygons>([]);

  const updateVisiblePolygons = () => {
    const zoom = map.getZoom();
    const bounds = map.getBounds();

    // Show polygons if zoom >= 14 or if any is a project-bounds type
    if (zoom >= 14 || polygons.some((p) => p.id === "primary-project")) {
      setVisiblePolygons(
        polygons.filter((polygon) =>
          polygon.positions.some((pos) => bounds.contains(pos))
        )
      );
    } else {
      setVisiblePolygons([]);
    }
  };

  useEffect(() => {
    if (!polygons || !polygons.length) {
      return;
    }
    updateVisiblePolygons(); // Initial update

    map.on("zoomend", () => {
      console.log("here");
      updateVisiblePolygons();
    });
    map.on("moveend", () => {
      console.log("here");
      updateVisiblePolygons();
    });

    return () => {
      map.off("zoomend", updateVisiblePolygons);
      map.off("moveend", updateVisiblePolygons);
    };
  }, [map, polygons]);

  return (
    <>
      {visiblePolygons.map((poly) => (
        <Polygon
          key={`polygon-${poly.id}`}
          positions={poly.positions}
          pathOptions={{
            color:
              poly.id === "primary-project"
                ? COLORS.textColorDark
                : COLORS.redIdentifier,
            weight: 3,
            fillOpacity: 0.4,
            fillColor:
              poly.id === "primary-project"
                ? COLORS.textColorDark
                : COLORS.redIdentifier,
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
