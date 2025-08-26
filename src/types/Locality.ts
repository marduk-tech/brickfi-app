export interface Locality {
  _id: string;
  name: string;
  aliases: string[];
  location: {
    lat: number;
    lng: number;
    bounds: any;
  };
  createdAt: string;
  updatedAt: string;
}
