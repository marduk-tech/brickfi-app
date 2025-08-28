import React, { useEffect, useState } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

interface BoundsAwareDriversProps {
  renderRoadDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
  renderTransitDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
  renderSimpleDrivers: (bounds: L.LatLngBounds) => React.ReactNode;
}

/**
 * Only renders drivers when they are in the view window.
 */
export const BoundsAwareDrivers = ({
  renderRoadDrivers,
  renderTransitDrivers,
  renderSimpleDrivers,
}: BoundsAwareDriversProps) => {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useEffect(() => {
    const updateBounds = () => {
      setBounds(map.getBounds());
    };

    // Update bounds on map move and zoom
    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map]);

  return (
    <>
      {renderRoadDrivers(bounds)}
      {renderTransitDrivers(bounds)}
      {renderSimpleDrivers(bounds)}
    </>
  );
};