import { RentalLocalityAnchor } from "@/types/Rental";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { getRentDomain, psfToRgb } from "./rental-colors";

const SIGMA_M = 550;
const CUTOFF_M = SIGMA_M * 3;
const TILE = 256;
const CELL = 4;
const CELLS = TILE / CELL;
const MAX_ALPHA = 0.85;
const M_PER_DEG_LAT = 110574;

interface RentalSurfaceLayerProps {
  anchors: RentalLocalityAnchor[];
}

export const RentalSurfaceLayer = ({ anchors }: RentalSurfaceLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!anchors.length) return;

    const domain = getRentDomain(anchors);
    const mPerDegLng = 111320 * Math.cos((anchors[0].lat * Math.PI) / 180);
    const twoSigma2 = 2 * SIGMA_M * SIGMA_M;
    const cutoff2 = CUTOFF_M * CUTOFF_M;

    const sample = (lat: number, lng: number) => {
      let wSum = 0;
      let psfSum = 0;
      for (const a of anchors) {
        const dx = (lng - a.lng) * mPerDegLng;
        const dy = (lat - a.lat) * M_PER_DEG_LAT;
        const d2 = dx * dx + dy * dy;
        if (d2 > cutoff2) continue;
        const w = a.count * Math.exp(-d2 / twoSigma2);
        wSum += w;
        psfSum += w * a.medianPsf;
      }
      return { wSum, psf: wSum ? psfSum / wSum : 0 };
    };

    // the busiest locality gets full strength
    const densityRef = Math.max(
      ...anchors.map((a) => sample(a.lat, a.lng).wSum),
    );

    const padLat = CUTOFF_M / M_PER_DEG_LAT;
    const padLng = CUTOFF_M / mPerDegLng;
    const bounds = L.latLngBounds(anchors.map((a) => [a.lat, a.lng]));
    const paddedBounds = L.latLngBounds(
      [bounds.getSouth() - padLat, bounds.getWest() - padLng],
      [bounds.getNorth() + padLat, bounds.getEast() + padLng],
    );

    const SurfaceLayer = L.GridLayer.extend({
      // className pins tile opacity, see globals.scss
      options: {
        bounds: paddedBounds,
        zIndex: 2,
        tileSize: TILE,
        className: "rental-surface-layer",
      },
      createTile(coords: L.Coords) {
        const tile = document.createElement("canvas");
        tile.width = TILE;
        tile.height = TILE;

        // sample at a coarse grid, then let the browser smooth it up to tile size
        const small = document.createElement("canvas");
        small.width = CELLS;
        small.height = CELLS;
        const smallCtx = small.getContext("2d");
        const ctx = tile.getContext("2d");
        if (!smallCtx || !ctx) return tile;

        const img = smallCtx.createImageData(CELLS, CELLS);
        const originX = coords.x * TILE;
        const originY = coords.y * TILE;

        // mercator: lng only depends on x, lat only on y
        const lngs: number[] = [];
        const lats: number[] = [];
        for (let i = 0; i < CELLS; i++) {
          const offset = (i + 0.5) * CELL;
          lngs.push(map.unproject([originX + offset, originY], coords.z).lng);
          lats.push(map.unproject([originX, originY + offset], coords.z).lat);
        }

        for (let row = 0; row < CELLS; row++) {
          for (let col = 0; col < CELLS; col++) {
            const { wSum, psf } = sample(lats[row], lngs[col]);
            const strength = Math.min(1, wSum / densityRef);
            const alpha = Math.pow(strength, 0.6) * MAX_ALPHA;
            if (alpha < 0.03) continue;
            const [r, g, b] = psfToRgb(psf, domain);
            const idx = (row * CELLS + col) * 4;
            img.data[idx] = r;
            img.data[idx + 1] = g;
            img.data[idx + 2] = b;
            img.data[idx + 3] = Math.round(alpha * 255);
          }
        }

        smallCtx.putImageData(img, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(small, 0, 0, TILE, TILE);
        return tile;
      },
    });

    const layer: L.GridLayer = new SurfaceLayer();
    layer.addTo(map);

    return () => {
      layer.remove();
    };
  }, [map, anchors]);

  return null;
};
