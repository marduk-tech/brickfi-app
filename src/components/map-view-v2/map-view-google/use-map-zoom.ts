"use client";

import { useEffect, useState } from "react";
import { useMap } from "@vis.gl/react-google-maps";

/**
 * Returns the current zoom level of the nearest parent Map, updating on
 * every zoom_changed event. Initialises from the map's current zoom so
 * the first render already has the correct value.
 */
export function useMapZoom(): number {
  const map = useMap();
  const [zoom, setZoom] = useState<number>(map?.getZoom() ?? 12);

  useEffect(() => {
    if (!map) return;
    setZoom(map.getZoom() ?? 12);
    const listener = map.addListener("zoom_changed", () => {
      setZoom(map.getZoom() ?? 12);
    });
    return () => google.maps.event.removeListener(listener);
  }, [map]);

  return zoom;
}
