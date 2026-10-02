import L, { LatLngTuple } from "leaflet";
import React, { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";
import { ProjectMarkerInput } from "../types";

// Leaflet's flyTo/flyToBounds animate natively (unlike Google Maps' JS API,
// which needs a stepped-zoom workaround - see map-view-google/map-camera.tsx)
// - but MapResizeHandler below (layeradd/layerremove -> debounced
// setView(getCenter(), getZoom())) was deliberately NOT animated for
// MapCenterHandler's fitPoints case because that same corrective setView can
// fire mid-flight and freeze an in-progress animation at whatever point it's
// currently interpolated to (getCenter()/getZoom() mid-flyTo return the
// current interpolated values, not the destination). Rather than give up on
// animating the rest of this file's transitions, mark the map as "mid-flight"
// for the duration of each one (a flag on the map instance itself, not
// module/context state, since each map owns its own) so MapResizeHandler can
// skip its snap-back exactly while that would cut an animation short.
const isMapFlying = (map: L.Map) => !!(map as any).__flyingTransition;

const withFlyingFlag = (map: L.Map, fn: () => void) => {
  (map as any).__flyingTransition = true;
  const clear = () => {
    (map as any).__flyingTransition = false;
    map.off("moveend", clear);
  };
  map.on("moveend", clear);
  fn();
};

export const flyToPoint = (
  map: L.Map,
  latlng: { lat: number; lng: number },
  zoom?: number,
) => {
  withFlyingFlag(map, () => map.flyTo([latlng.lat, latlng.lng], zoom ?? map.getZoom()));
};

export const flyToAreaBounds = (
  map: L.Map,
  bounds: L.LatLngBounds,
  maxZoom: number,
) => {
  withFlyingFlag(map, () => map.flyToBounds(bounds, { maxZoom }));
};

interface MapCenterHandlerProps {
  projectData: any;
  projects?: ProjectMarkerInput[];
  initialZoom?: number;
  fitPoints?: { lat: number; lng: number }[];
}

// Caps how tight flyToAreaBounds is allowed to zoom in for a 2+ project
// list - without this, a couple of results right next to each other would
// zoom in uncomfortably close.
const PROJECTS_LIST_MAX_ZOOM = 15;

export const MapCenterHandler = ({
  projectData,
  projects,
  initialZoom,
  fitPoints,
}: MapCenterHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (fitPoints?.length) {
      const points: LatLngTuple[] = fitPoints.map((p) => [p.lat, p.lng]);
      if (
        projectData?.info?.location?.lat &&
        projectData?.info?.location?.lng
      ) {
        points.push([
          projectData.info.location.lat,
          projectData.info.location.lng,
        ]);
      }
      // no animation: MapResizeHandler's setView on layeradd would cut an animated pan short
      const fit = () =>
        map.fitBounds(points, { padding: [24, 24], animate: false });
      const hasSize = () => {
        const size = map.invalidateSize().getSize();
        return size.x > 0 && size.y > 0;
      };

      if (!hasSize()) {
        const onResize = () => {
          if (!hasSize()) return;
          map.off("resize", onResize);
          fit();
        };
        map.on("resize", onResize);
        return () => {
          map.off("resize", onResize);
        };
      }
      fit();
    } else if (
      projectData &&
      projectData?.info?.location?.lat &&
      projectData?.info?.location?.lng
    ) {
      flyToPoint(
        map,
        {
          lat: projectData.info.location.lat,
          lng: projectData.info.location.lng,
        },
        initialZoom || 12,
      );
    } else if (projects?.length) {
      const valid = projects.filter((p) => !!p.location?.lat && !!p.location?.lng);
      if (valid.length === 1) {
        // fitBounds on a single-point bounds snaps to the map's max zoom,
        // which is jarringly tight for one marker - center+fixed-zoom
        // instead, same as the projectData branch above.
        flyToPoint(map, valid[0].location!, 14);
      } else if (valid.length > 1) {
        // fit every result in view rather than a fixed guessed zoom level,
        // so the zoom actually reflects how spread out this particular
        // batch of results is - previously capped to "fewer than 10
        // projects", which silently never fired for the default 10-result
        // search.
        const bounds = L.latLngBounds(
          valid.map((p) => [p.location!.lat, p.location!.lng] as LatLngTuple),
        );
        flyToAreaBounds(map, bounds, PROJECTS_LIST_MAX_ZOOM);
      }
    }
  }, [projectData, map, projects, initialZoom, fitPoints]);

  return null;
};

interface MapFocusHandlerProps {
  projects?: ProjectMarkerInput[];
  focusedProjectId?: string | null;
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

const FOCUS_ZOOM = 15;

export const MapFocusHandler = ({
  projects,
  focusedProjectId,
  openModal,
}: MapFocusHandlerProps) => {
  const map = useMap();
  const previousViewRef = useRef<{ center: LatLngTuple; zoom: number } | null>(
    null,
  );

  useEffect(() => {
    if (!focusedProjectId) {
      const previousView = previousViewRef.current;
      if (previousView) {
        flyToPoint(
          map,
          { lat: previousView.center[0], lng: previousView.center[1] },
          previousView.zoom,
        );
        previousViewRef.current = null;
      }
      return;
    }

    const project = projects?.find((p) => p.id === focusedProjectId);
    if (!project?.location?.lat || !project?.location?.lng) return;

    if (!previousViewRef.current) {
      const center = map.getCenter();
      previousViewRef.current = {
        center: [center.lat, center.lng],
        zoom: map.getZoom(),
      };
    }

    flyToPoint(map, {
      lat: project.location.lat,
      lng: project.location.lng,
    });
    openModal(project.modalContent, {
      lat: project.location.lat,
      lng: project.location.lng,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusedProjectId, projects]);

  return null;
};

export const MapResizeHandler = () => {
  const map = useMap();
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // handle map refresh
  const handleMapRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      map.invalidateSize();
      // skip the corrective snap while a deliberate flyTo/flyToBounds is
      // mid-flight (see withFlyingFlag above) - getCenter()/getZoom() return
      // the current interpolated values during an animation, not the
      // destination, so calling setView with them here would freeze that
      // animation wherever it currently is instead of letting it finish.
      if (isMapFlying(map)) return;
      map.setView(map.getCenter(), map.getZoom());
    }, 100);
  }, [map]);

  useEffect(() => {
    map.on("layeradd layerremove", handleMapRefresh);
    return () => {
      map.off("layeradd layerremove", handleMapRefresh);
    };
  }, [map, handleMapRefresh]);

  useEffect(() => {
    containerRef.current = map.getContainer();
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver(handleMapRefresh);
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      if (resizeObserverRef.current && containerRef.current) {
        resizeObserverRef.current.unobserve(containerRef.current);
      }
    };
  }, [map, handleMapRefresh]);

  return null;
};

interface MapInstanceCaptureProps {
  onMapReady: (map: any) => void;
}

export const MapInstanceCapture = ({ onMapReady }: MapInstanceCaptureProps) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
};

// Recursively walks a GeoJSON coordinates array - a Point is [lng, lat], a
// LineString is an array of those, a Polygon/MultiLineString nests one level
// deeper, a MultiPolygon deeper still - and extends `bounds` with every
// [lng, lat] pair found (note the flip to Leaflet's [lat, lng] order), so
// "fit the camera to this thing" works the same way regardless of which of
// those shapes the thing's own geometry happens to be. Mirrors
// map-view-google/map-camera.tsx's same-named helper.
const extendBoundsFromCoordinates = (
  bounds: L.LatLngBounds,
  coordinates: any,
): void => {
  if (!Array.isArray(coordinates)) return;
  if (
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    bounds.extend([coordinates[1], coordinates[0]]);
    return;
  }
  coordinates.forEach((c) => extendBoundsFromCoordinates(bounds, c));
};

// Corridor/microPocket docs carry their outline as geoJson.features[0] (see
// CorridorMarkers/MicroPocketMarkers) - a single Feature, not a
// FeatureCollection of several.
const boundsFromGeoJson = (geoJson: any): L.LatLngBounds | null => {
  const geometry = geoJson?.features?.[0]?.geometry;
  if (!geometry?.coordinates) return null;
  const bounds = L.latLngBounds([]);
  extendBoundsFromCoordinates(bounds, geometry.coordinates);
  return bounds.isValid() ? bounds : null;
};

// A driver's `features` (transit/highway line alignments etc) is an array
// of Features, unlike corridor/microPocket's single-Feature geoJson above.
const boundsFromFeatures = (features: any): L.LatLngBounds | null => {
  const list: any[] = Array.isArray(features)
    ? features
    : Object.values(features || {});
  if (!list.length) return null;
  const bounds = L.latLngBounds([]);
  list.forEach((f) => {
    if (f?.geometry?.coordinates) {
      extendBoundsFromCoordinates(bounds, f.geometry.coordinates);
    }
  });
  return bounds.isValid() ? bounds : null;
};

const focusOnPoint = (
  map: L.Map,
  location: { lat?: number; lng?: number } | undefined,
  zoom: number,
) => {
  if (!location?.lat || !location?.lng) return false;
  flyToPoint(map, { lat: location.lat, lng: location.lng }, zoom);
  return true;
};

// Prefers fitting the item's own outline (so an oddly-shaped/large corridor
// is fully in view, not just its label point) over a guessed fixed zoom,
// falling back to its point location only when it has no outline. maxZoom
// also clamps flyToBounds' own computed zoom - kept just under
// CorridorMarkers'/MicroPocketMarkers' own CORRIDOR_MAX_ZOOM (12.5)/
// MICROPOCKET_MAX_ZOOM (13.5), since those layers stop rendering above their
// threshold and centering past that would make the very thing just centered
// on immediately disappear.
const focusOnOutlinedItem = (map: L.Map, item: any, maxZoom: number) => {
  const bounds = boundsFromGeoJson(item?.geoJson);
  if (bounds) {
    flyToAreaBounds(map, bounds, maxZoom);
    return;
  }
  focusOnPoint(map, item?.location, maxZoom);
};

const focusOnDriver = (map: L.Map, driver: any) => {
  if (focusOnPoint(map, driver?.location, DRIVER_FOCUS_ZOOM)) return;
  const bounds = boundsFromFeatures(driver?.features);
  if (bounds) flyToAreaBounds(map, bounds, DRIVER_FOCUS_ZOOM);
};

const LOCALITY_FOCUS_ZOOM = 15;
const DRIVER_FOCUS_ZOOM = 15;
const CORRIDOR_FOCUS_MAX_ZOOM = 12;
const MICROPOCKET_FOCUS_MAX_ZOOM = 13;

interface ActiveFocusCentererProps {
  localities?: any[];
  corridors?: any[];
  microPockets?: any[];
  drivers?: any[];
}

// Leaflet counterpart to map-view-google/map-camera.tsx's
// ActiveFocusCenterer - centers/zooms the camera onto whichever of
// localities/corridors/microPockets/drivers currently resolves to exactly
// one record (the "active" one, e.g. a referred-location chip click
// narrowing showLocalities/showCorridors/showMicroPockets down to a single
// id - see brickchat-client.tsx/brick-map-chat.tsx), as opposed to "all" or
// an unfiltered default set, which stay put rather than fighting
// MapCenterHandler's own list-driven framing. Checked in this order since a
// plan only ever narrows one of these at a time in practice (see
// getReferredLocationItems - a single-select focus), but a fixed priority
// order still matters if that ever changes.
export const ActiveFocusCenterer = ({
  localities,
  corridors,
  microPockets,
  drivers,
}: ActiveFocusCentererProps) => {
  const map = useMap();

  useEffect(() => {
    if (corridors?.length === 1) {
      focusOnOutlinedItem(map, corridors[0], CORRIDOR_FOCUS_MAX_ZOOM);
      return;
    }
    if (microPockets?.length === 1) {
      focusOnOutlinedItem(map, microPockets[0], MICROPOCKET_FOCUS_MAX_ZOOM);
      return;
    }
    if (localities?.length === 1) {
      focusOnPoint(map, localities[0]?.location, LOCALITY_FOCUS_ZOOM);
      return;
    }
    if (drivers?.length === 1) {
      focusOnDriver(map, drivers[0]);
      return;
    }
  }, [map, localities, corridors, microPockets, drivers]);

  return null;
};
