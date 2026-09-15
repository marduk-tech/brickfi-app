export interface RentalDetail {
  description: string;
  monthlyRent: string;
  sizeSqft: number;
  localityId?: string;
  approxDistanceInKmsFromProperty?: number;
}

export type BhkBucket = 1 | 2 | 3 | "4+";
export type BhkFilter = "all" | BhkBucket;

export interface RentalListing {
  rent: number;
  sqft: number;
  psf: number;
  bhk: BhkBucket | null;
  localityId?: string;
  distanceKm?: number;
  society: string;
}

export interface RentalLocalityAnchor {
  localityId: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  medianPsf: number;
  medianRent: number;
  minRent: number;
  maxRent: number;
  distanceKm?: number;
}
