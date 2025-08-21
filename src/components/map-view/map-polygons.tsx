import { useEffect, useState } from "react";
import { Polygon, useMap } from "react-leaflet";
import { COLORS } from "../../theme/style-constants";

export const MapPolygons = ({
  polygons,
}: {
  polygons: Array<{
    id: string;
    positions: [number, number][];
    name: string;
    description: string;
  }>;
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
    updateVisiblePolygons(); // Initial update

    map.on("zoomend", updateVisiblePolygons);
    map.on("moveend", updateVisiblePolygons);

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
        />
      ))}
    </>
  );
};
