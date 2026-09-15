import { LvnzyProject } from "@/types/LvnzyProject";
import {
  BhkBucket,
  BhkFilter,
  RentalDetail,
  RentalListing,
  RentalLocalityAnchor,
} from "@/types/Rental";
import { median } from "./stats";

// anything outside this ₹/sqft band is a bad scrape, not a real rent
const MIN_PSF = 5;
const MAX_PSF = 250;

export function parseMonthlyRent(raw?: string | number): number | null {
  if (typeof raw === "number") return raw > 0 ? raw : null;
  if (!raw) return null;
  const match = raw.match(/([\d,.]+)\s*(lacs?|lakhs?|l|cr|crore)?\b/i);
  if (!match) return null;
  let amount = parseFloat(match[1].replace(/,/g, ""));
  if (!amount || isNaN(amount)) return null;
  const unit = (match[2] || "").toLowerCase();
  if (unit.startsWith("cr")) amount *= 1e7;
  else if (unit) amount *= 1e5;
  return Math.round(amount);
}

export function parseBhk(description?: string): BhkBucket | null {
  const match = description?.match(/(\d+)\s*BHK/i);
  if (!match) return null;
  const n = parseInt(match[1]);
  if (n >= 4) return "4+";
  if (n === 1 || n === 2 || n === 3) return n;
  return null;
}

export function buildRentalListings(
  lvnzyProject?: LvnzyProject,
): RentalListing[] {
  const details: RentalDetail[] = lvnzyProject?.investment?.rentalDetails || [];
  if (!Array.isArray(details)) return [];

  return details.flatMap((d) => {
    const rent = parseMonthlyRent(d.monthlyRent);
    const sqft = Number(d.sizeSqft);
    if (!rent || !sqft) return [];
    const psf = rent / sqft;
    if (psf < MIN_PSF || psf > MAX_PSF) return [];

    // first line of the description is the society name
    const society = (d.description || "")
      .split("\n")[0]
      .replace(/^-\s*/, "")
      .trim();

    return [
      {
        rent,
        sqft,
        psf,
        bhk: parseBhk(d.description),
        localityId: d.localityId ? String(d.localityId) : undefined,
        distanceKm: d.approxDistanceInKmsFromProperty,
        society,
      },
    ];
  });
}

export function filterListingsByBhk(
  listings: RentalListing[],
  bhk: BhkFilter,
): RentalListing[] {
  return bhk === "all" ? listings : listings.filter((l) => l.bhk === bhk);
}

export function buildRentalAnchors(
  listings: RentalListing[],
  lvnzyProject?: LvnzyProject,
): RentalLocalityAnchor[] {
  const localities = new Map<
    string,
    { name: string; lat: number; lng: number }
  >();
  (lvnzyProject?.originalProjectId?.info?.localities || []).forEach(
    (l: any) => {
      const loc = l?.localityId;
      if (loc?._id && loc.location?.lat && loc.location?.lng) {
        localities.set(String(loc._id), {
          name: loc.name,
          lat: loc.location.lat,
          lng: loc.location.lng,
        });
      }
    },
  );

  const groups = new Map<string, RentalListing[]>();
  listings.forEach((l) => {
    if (!l.localityId || !localities.has(l.localityId)) return;
    const group = groups.get(l.localityId) || [];
    group.push(l);
    groups.set(l.localityId, group);
  });

  return Array.from(groups.entries()).map(([localityId, group]) => {
    const locality = localities.get(localityId)!;
    const rents = group.map((g) => g.rent);
    return {
      localityId,
      name: locality.name,
      lat: locality.lat,
      lng: locality.lng,
      count: group.length,
      medianPsf: median(group.map((g) => g.psf)),
      medianRent: median(rents),
      minRent: Math.min(...rents),
      maxRent: Math.max(...rents),
      distanceKm: group[0].distanceKm,
    };
  });
}
