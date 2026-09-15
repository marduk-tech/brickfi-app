import { RentalLocalityAnchor } from "@/types/Rental";
import L from "leaflet";
import { useMemo, useState } from "react";
import { Marker, useMap, useMapEvents } from "react-leaflet";
import { rupeeAmountFormat } from "../../../libs/lvnzy-helper";
import { COLORS } from "../../../theme/style-constants";
import { getRentDomain, psfToColor } from "../map-layers/rental-colors";
import { MapModalContent, MapModalGeoPosition } from "../map-modal";

const DOT = 12;
const LABEL_H = 20;
const LABEL_GAP = 4;

const CHAR_W = 6.2;
const LABEL_PAD = 14;

interface RentalLocalityMarkersProps {
  anchors: RentalLocalityAnchor[];
  openModal: (content: MapModalContent, position?: MapModalGeoPosition) => void;
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const formatRent = (amt: number) =>
  amt >= 100000
    ? `₹${rupeeAmountFormat(amt)}`
    : `₹${Math.round(amt).toLocaleString("en-IN")}`;

const labelText = (a: RentalLocalityAnchor) =>
  `₹${Math.round(a.medianPsf)}/sqft · ${a.count}`;

export const RentalLocalityMarkers = ({
  anchors,
  openModal,
}: RentalLocalityMarkersProps) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });

  const domain = useMemo(() => getRentDomain(anchors), [anchors]);

  // busiest localities claim their label spot first, the rest fall back to a dot.
  // a label must not cover another label or anyone else's dot.
  const labelled = useMemo(() => {
    type Box = { id: string; x1: number; y1: number; x2: number; y2: number };
    const overlaps = (a: Box, b: Box) =>
      a.id !== b.id && a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;

    const points = anchors.map((a) => ({
      a,
      p: map.project([a.lat, a.lng], zoom),
    }));
    const placed: Box[] = points.map(({ a, p }) => ({
      id: a.localityId,
      x1: p.x - DOT / 2,
      x2: p.x + DOT / 2,
      y1: p.y - DOT / 2,
      y2: p.y + DOT / 2,
    }));
    const ids = new Set<string>();

    points
      .sort((x, y) => y.a.count - x.a.count)
      .forEach(({ a, p }) => {
        const w = labelText(a).length * CHAR_W + LABEL_PAD;
        const box: Box = {
          id: a.localityId,
          x1: p.x - w / 2,
          x2: p.x + w / 2,
          y1: p.y - DOT / 2 - LABEL_GAP - LABEL_H,
          y2: p.y - DOT / 2 - LABEL_GAP,
        };
        if (!placed.some((b) => overlaps(box, b))) {
          placed.push(box);
          ids.add(a.localityId);
        }
      });
    return ids;
  }, [anchors, map, zoom]);

  return (
    <>
      {anchors.map((a) => {
        const color = psfToColor(a.medianPsf, domain);
        const label = labelled.has(a.localityId)
          ? `<div style="position:absolute;bottom:${DOT + LABEL_GAP}px;left:50%;transform:translateX(-50%);
              white-space:nowrap;background:white;border:1px solid ${COLORS.borderColorDark};border-radius:12px;
              padding:1px 6px;font-size:11px;font-weight:500;line-height:16px;color:${COLORS.textColorDark};
              box-shadow:0 0 6px rgba(0,0,0,0.25)">${escapeHtml(labelText(a))}</div>`
          : "";
        const icon = L.divIcon({
          className: "",
          iconSize: [DOT, DOT],
          iconAnchor: [DOT / 2, DOT / 2],
          html: `<div style="position:relative;width:${DOT}px;height:${DOT}px">
              <div style="width:${DOT}px;height:${DOT}px;border-radius:50%;background:${color};
                border:2px solid white;box-sizing:border-box;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>
              ${label}
            </div>`,
        });

        return (
          <Marker
            key={`rental-${a.localityId}`}
            position={[a.lat, a.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                const tags = [
                  { label: `${a.count} listings`, color: COLORS.textColorDark },
                ];
                if (a.distanceKm !== undefined) {
                  tags.push({
                    label: `${a.distanceKm} km away`,
                    color: COLORS.textColorDark,
                  });
                }
                openModal(
                  {
                    title: a.name,
                    tags,
                    content: `**₹${Math.round(a.medianPsf)}/sqft** median rent\n\nTypical ${formatRent(a.medianRent)}/month · range ${formatRent(a.minRent)} – ${formatRent(a.maxRent)}`,
                  },
                  { lat: a.lat, lng: a.lng },
                );
              },
            }}
          />
        );
      })}
    </>
  );
};
