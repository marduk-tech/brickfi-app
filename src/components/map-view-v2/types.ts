import { IDriverPlace } from "../../types/Project";

export type GeoJSONCoordinate = [number, number];
export type GeoJSONLineString = GeoJSONCoordinate[];
export type GeoJSONMultiLineString = GeoJSONLineString[];
export type GeoJSONPolygon = GeoJSONLineString[];
export type GeoJSONMultiPolygon = GeoJSONPolygon[];

export interface GeoJSONGeometry {
  type: "Point" | "LineString" | "MultiLineString" | "Polygon" | "MultiPolygon";
  coordinates:
    | GeoJSONCoordinate
    | GeoJSONLineString
    | GeoJSONMultiLineString
    | GeoJSONPolygon
    | GeoJSONMultiPolygon;
}

export interface GeoJSONFeature {
  type: "Feature";
  properties?: {
    strokeColor?: string;
    name?: string;
    Name?: string;
    status?: string;
  };
  geometry: GeoJSONGeometry;
}

export interface GeoJSONPointFeature extends GeoJSONFeature {
  geometry: {
    type: "Point";
    coordinates: GeoJSONCoordinate;
  };
}

export type RoadDriverPlace = IDriverPlace & {
  features: GeoJSONFeature[];
};

export type TransitDriverPlace = IDriverPlace & {
  features: GeoJSONFeature[];
};
