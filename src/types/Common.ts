export interface NavLink {
  key: string;
  title: string;
  link?: string;
  icon: {
    name?: string;
    set?: string;
    src?: string;
  };
  alignBottom?: boolean;
  disabled?: boolean;
}

export interface ILivIndexPlaces {
  _id: string;
  name: string;
  description?: string;
  type?: PlaceType;
  placeId?: string;
  pincode?: string;
  location?: google.maps.LatLngLiteral;
  status?: string;
  parameters?: {
    proximityThreshold?: number;
    triggerCoefficient?: number;
    growthLever?: boolean;
  };
  features?: any;
  driver: string;
  megaDriver: string;
  createdAt: Date;
  updatedAt: Date;
  details: any;
}

export type PlaceType = "highway" | "hospital" | "school" | "futureInfra";

export interface ProjectAIResponse {
  projectId: string;
  projectName: string;
  relevantDetails: string;
  relevancyScore: number;
  projectCategories: string[];
}
