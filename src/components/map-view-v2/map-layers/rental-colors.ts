import { RentalLocalityAnchor } from "@/types/Rental";

export const RENT_RAMP = [
  "#f39f64",
  "#ec8043",
  "#dd5f2a",
  "#bd451a",
  "#8c2d0c",
];

const RAMP_RGB = RENT_RAMP.map((hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]);

export type RentDomain = [number, number];

export function getRentDomain(anchors: RentalLocalityAnchor[]): RentDomain {
  const values = anchors.map((a) => a.medianPsf);
  return [Math.min(...values), Math.max(...values)];
}

export function psfToRgb(psf: number, [min, max]: RentDomain): number[] {
  const t =
    max > min ? Math.min(1, Math.max(0, (psf - min) / (max - min))) : 0.5;
  const pos = t * (RAMP_RGB.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, RAMP_RGB.length - 1);
  const f = pos - lo;
  return RAMP_RGB[lo].map((c, i) => Math.round(c + (RAMP_RGB[hi][i] - c) * f));
}

export function psfToColor(psf: number, domain: RentDomain): string {
  const [r, g, b] = psfToRgb(psf, domain);
  return `rgb(${r}, ${g}, ${b})`;
}
