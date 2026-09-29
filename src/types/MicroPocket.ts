export interface MicroPocket {
  _id: string;
  name: string;
  aliases: string[];
  location: {
    lat: number;
    lng: number;
  };
  description: string;
  geoJson?: any;
  createdAt: string;
  updatedAt: string;
}
