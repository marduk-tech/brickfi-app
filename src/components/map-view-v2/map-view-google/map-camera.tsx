"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";
import { ProjectMarkerInput } from "../types";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";

// Google Maps JS API has no built-in smooth zoom - setZoom/fitBounds always
// jump straight to the target level. The common workaround (used throughout
// this file instead of raw setCenter/setZoom/fitBounds): step one zoom
// level at a time, waiting for the map to go idle between steps - each
// individual single-level step DOES render with Maps' own built-in smooth
// zoom transition, so stepping through them back to back reads as one
// continuous zoom rather than a hard cut. panTo (unlike setCenter) is
// already animated natively, so pairing it with stepped zoom covers both
// halves of a "fly to" transition.
const smoothZoomTo = (map: google.maps.Map, targetZoom: number) => {
  const target = Math.round(targetZoom);

  const advance = () => {
    const zoomNow = Math.round(map.getZoom() ?? target);
    if (zoomNow === target) return;
    const step = zoomNow < target ? 1 : -1;
    const listener = map.addListener("idle", () => {
      listener.remove();
      advance();
    });
    map.setZoom(zoomNow + step);
  };
  advance();
};

// Animated pan (native) + stepped animated zoom (see smoothZoomTo above) to
// a known center/zoom - the shared "fly to a point" primitive every
// center-changing effect in this file uses instead of an instant
// setCenter+setZoom jump.
const flyTo = (
  map: google.maps.Map,
  center: { lat: number; lng: number },
  zoom: number,
) => {
  map.panTo(center);
  smoothZoomTo(map, zoom);
};

// fitBounds itself still jumps instantly - there's no native animated
// equivalent for "fit the viewport to this area". Worked around by letting
// fitBounds compute (synchronously, before the next paint) what center/zoom
// it would have landed on, immediately snapping back to wherever the camera
// already was, then flying there smoothly instead (see flyTo) - so an
// outline-fit transition feels the same as a point-focus one rather than a
// visible jump-cut.
const flyToBounds = (
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds,
  maxZoom: number,
) => {
  const priorCenter = map.getCenter();
  const priorZoom = map.getZoom();

  map.fitBounds(bounds);
  const targetCenter = map.getCenter();
  const targetZoom = Math.min(map.getZoom() ?? maxZoom, maxZoom);

  if (priorCenter) map.setCenter(priorCenter);
  if (priorZoom != null) map.setZoom(priorZoom);

  if (targetCenter) {
    flyTo(map, { lat: targetCenter.lat(), lng: targetCenter.lng() }, targetZoom);
  }
};

interface MapCentererProps {
  primaryProject?: any;
  projects?: ProjectMarkerInput[];
  initialZoom?: number;
}

// Caps how tight fitBounds is allowed to zoom in for a 2+ project list -
// without this, a couple of results right next to each other would zoom in
// uncomfortably close.
const PROJECTS_LIST_MAX_ZOOM = 15;

export function MapCenterer({ primaryProject, projects, initialZoom }: MapCentererProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const lat = primaryProject?.info?.location?.lat;
    const lng = primaryProject?.info?.location?.lng;
    if (lat && lng) {
      flyTo(map, { lat, lng }, initialZoom ?? 14);
      return;
    }

    if (projects?.length) {
      const valid = projects.filter((p) => p.location?.lat && p.location?.lng);
      if (valid.length === 1) {
        // fitBounds on a single-point bounds snaps to the map's max zoom,
        // which is jarringly tight for one marker - center+fixed-zoom
        // instead, same as the primaryProject branch above.
        flyTo(map, valid[0].location, initialZoom ?? 14);
      } else if (valid.length > 1) {
        // fit every result in view rather than a fixed guessed zoom level,
        // so the zoom actually reflects how spread out this particular
        // batch of results is (a few blocks apart vs across the whole
        // city) - previously capped to "fewer than 10 projects", which
        // silently never fired for the default 10-result search.
        const bounds = new google.maps.LatLngBounds();
        valid.forEach((p) =>
          bounds.extend({ lat: p.location.lat, lng: p.location.lng }),
        );
        flyToBounds(map, bounds, initialZoom ?? PROJECTS_LIST_MAX_ZOOM);
      }
    }
  }, [map, primaryProject, projects, initialZoom]);

  return null;
}

interface MapFocusHandlerProps {
  projects?: ProjectMarkerInput[];
  focusedProjectId?: string | null;
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

const FOCUS_ZOOM = 16;

export function MapFocusHandler({ projects, focusedProjectId, openModal }: MapFocusHandlerProps) {
  const map = useMap();
  const previousViewRef = useRef<{ center: google.maps.LatLngLiteral; zoom: number } | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!focusedProjectId) {
      const previousView = previousViewRef.current;
      if (previousView) {
        flyTo(map, previousView.center, previousView.zoom);
        previousViewRef.current = null;
      }
      return;
    }

    const project = projects?.find((p) => p.id === focusedProjectId);
    if (!project?.location?.lat || !project?.location?.lng) return;

    if (!previousViewRef.current) {
      const center = map.getCenter();
      previousViewRef.current = {
        center: center ? { lat: center.lat(), lng: center.lng() } : { lat: project.location.lat, lng: project.location.lng },
        zoom: map.getZoom() ?? FOCUS_ZOOM,
      };
    }

    // panTo is already natively animated - no stepped zoom here since focus
    // entry doesn't change zoom level, only pans.
    map.panTo({ lat: project.location.lat, lng: project.location.lng });
    openModal(project.modalContent, {
      lat: project.location.lat,
      lng: project.location.lng,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, focusedProjectId, projects]);

  return null;
}

interface MapReadyProps {
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapReady({ onMapReady }: MapReadyProps) {
  const map = useMap();
  useEffect(() => {
    if (map && onMapReady) onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

// Recursively walks a GeoJSON coordinates array - a Point is [lng, lat], a
// LineString is an array of those, a Polygon/MultiLineString nests one level
// deeper, a MultiPolygon deeper still - and extends `bounds` with every
// [lng, lat] pair found, so "fit the camera to this thing" works the same
// way regardless of which of those shapes the thing's own geometry happens
// to be.
const extendBoundsFromCoordinates = (
  bounds: google.maps.LatLngBounds,
  coordinates: any,
): void => {
  if (!Array.isArray(coordinates)) return;
  if (
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    bounds.extend({ lat: coordinates[1], lng: coordinates[0] });
    return;
  }
  coordinates.forEach((c) => extendBoundsFromCoordinates(bounds, c));
};

// Corridor/microPocket docs carry their outline as geoJson.features[0]
// (see CorridorMarkers/MicroPocketMarkers) - a single Feature, not a
// FeatureCollection of several.
const boundsFromGeoJson = (geoJson: any): google.maps.LatLngBounds | null => {
  const geometry = geoJson?.features?.[0]?.geometry;
  if (!geometry?.coordinates) return null;
  const bounds = new google.maps.LatLngBounds();
  extendBoundsFromCoordinates(bounds, geometry.coordinates);
  return bounds.isEmpty() ? null : bounds;
};

// A driver's `features` (transit/highway line alignments etc - see
// TransitDrivers/RoadDrivers) is an array of Features, unlike
// corridor/microPocket's single-Feature geoJson above.
const boundsFromFeatures = (features: any): google.maps.LatLngBounds | null => {
  const list: any[] = Array.isArray(features)
    ? features
    : Object.values(features || {});
  if (!list.length) return null;
  const bounds = new google.maps.LatLngBounds();
  list.forEach((f) => {
    if (f?.geometry?.coordinates) {
      extendBoundsFromCoordinates(bounds, f.geometry.coordinates);
    }
  });
  return bounds.isEmpty() ? null : bounds;
};

const focusOnPoint = (
  map: google.maps.Map,
  location: { lat?: number; lng?: number } | undefined,
  zoom: number,
) => {
  if (!location?.lat || !location?.lng) return false;
  flyTo(map, { lat: location.lat, lng: location.lng }, zoom);
  return true;
};

// Prefers fitting the item's own outline (so an oddly-shaped/large corridor
// is fully in view, not just its label point) over a guessed fixed zoom,
// falling back to its point location only when it has no outline. maxZoom is
// also the clamp fitBounds' own computed zoom gets kept under - see
// flyToBounds and CORRIDOR_FOCUS_MAX_ZOOM/MICROPOCKET_FOCUS_MAX_ZOOM below
// for why (those layers stop rendering above their own max-zoom, so
// centering past that would make the very thing just centered on
// immediately disappear).
const focusOnOutlinedItem = (
  map: google.maps.Map,
  item: any,
  maxZoom: number,
) => {
  const bounds = boundsFromGeoJson(item?.geoJson);
  if (bounds) {
    flyToBounds(map, bounds, maxZoom);
    return;
  }
  focusOnPoint(map, item?.location, maxZoom);
};

const focusOnDriver = (map: google.maps.Map, driver: any) => {
  if (focusOnPoint(map, driver?.location, DRIVER_FOCUS_ZOOM)) return;
  const bounds = boundsFromFeatures(driver?.features);
  if (bounds) flyToBounds(map, bounds, DRIVER_FOCUS_ZOOM);
};

const LOCALITY_FOCUS_ZOOM = 15;
const DRIVER_FOCUS_ZOOM = 15;
// kept just under CorridorMarkers'/MicroPocketMarkers' own CORRIDOR_MAX_ZOOM
// (13) / MICROPOCKET_MAX_ZOOM (13.5).
const CORRIDOR_FOCUS_MAX_ZOOM = 12.5;
const MICROPOCKET_FOCUS_MAX_ZOOM = 13;

interface ActiveFocusCentererProps {
  localities?: any[];
  corridors?: any[];
  microPockets?: any[];
  drivers?: any[];
}

// Centers/zooms the camera onto whichever of localities/corridors/
// microPockets/drivers currently resolves to exactly one record - the
// "active" one, e.g. a referred-location chip click narrowing
// showLocalities/showCorridors/showMicroPockets down to a single id (see
// brickchat-client.tsx/brick-map-chat.tsx), as opposed to "all" or an
// unfiltered default set, which stay put rather than fighting
// MapCenterer's own list-driven framing. Checked in this order since a plan
// only ever narrows one of these at a time in practice (see
// getReferredLocationItems - a single-select focus), but a fixed priority
// order still matters if that ever changes.
export function ActiveFocusCenterer({
  localities,
  corridors,
  microPockets,
  drivers,
}: ActiveFocusCentererProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

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
}
