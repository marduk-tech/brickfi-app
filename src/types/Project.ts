import { PLACE_TIMELINE, ProjectHomeType } from "../libs/constants";
import { ILivIndexPlaces } from "./Common";

export interface IMedia {
  _id: string;
  type: "image" | "video";
  image?: {
    url: string;
    tags: string[];
    caption?: string;
  };
  isPreview: boolean;
  video?: {
    url: string;
    tags: string[];
    caption?: string;
    bunnyVideoId?: string;
    bunnyTitle?: string;
    status?: string;
    directPlayUrl?: string;
    hlsUrl?: string;
    thumbnailUrl?: string;
    previewUrl?: string;
    isYoutube?: boolean;
    youtubeUrl?: string;
    bunnyLibraryId?: number;
  };
}

export interface ILocation {
  mapLink: string;
  lat: number;
  lng: number;
}

export interface IProjectCorridor {
  corridorId: string;
  haversineDistance: number;
}

export interface IMetadata {
  _id: string;
  name: string;
  location: ILocation;
  website: string;
  oneLiner?: string;
  description: string;
  summary: string;
  homeType: ProjectHomeType;
  corridors: IProjectCorridor[];
}

export interface ILand {
  _id: string;
  total_area: string;
  plantation: string;
  irrigation: string;
  water_bodies: string;
  others: string;
}

export interface IPlots {
  _id: string;
  size_mix: string;
  facing_mix: string;
  shape_mix: string;
  plots_list: string;
  villa: string;
  cost_range: string;
  others: string;
}

export interface IConnectivity {
  _id: string;
  roads: string;
  towns: string;
  schools: string;
  hospital: string;
  airport: string;
  others: string;
}

export interface IClimate {
  _id: string;
  rainfall: string;
  temperature: string;
  humidity: string;
  others: string;
}

export interface IBasicInfra {
  _id: string;
  electricity: string;
  water_supply: string;
  pathways: string;
  security: string;
  others: string;
}

export interface IAmenities {
  _id: string;
  sports_external: string;
  swimming_pool: string;
  clubhouse: string;
  kids: string;
  parks: string;
  parking: string;
  others: string;
}

export interface ITeam {
  _id: string;
  partners: string;
  experience: string;
  others: string;
}

export interface IUI {
  description: string;
  oneLiner: string;
  projectHighlights: any;
  costingDetails: any;
  amenitiesSummary: any;
  statusDetails: any;
  builderDetails: any;
  landDetails: any;
}

export interface Project {
  _id: string;
  info: any;
  metadata: IMetadata;
  land: ILand;
  plots: IPlots;
  media: IMedia[];
  connectivity: IConnectivity;
  climate: IClimate;
  basic_infra: IBasicInfra;
  amenities: IAmenities;
  team: ITeam;
  ui: IUI;
  createdAt: string;
  updatedAt: string;
  livestment: ILivestment;
  livIndexScore: ILivIndexScore;
  relevantDetails: string;
}

export interface ProjectField {
  dbField: string;
  fieldDisplayName: string;
  fieldDescription: string;
  mustHave?: boolean;
  hide?: boolean;
}

export interface IDriverConfig {
  label?: string;
  icon: {
    name: string;
    set: any;
  };
  zIndex: number;
}

export interface ISurroundingElement {
  type: string;
  description: string;
  geometry: any;
  impact: number;
}

export interface IDriverPlace {
  _id: string;
  name: string;
  description?: string;
  details?: {
    oneLiner: string;
    description: string;
    footfall: number;
    icon?: string;
    info: any;
  };
  location?: {
    lat: number;
    lng: number;
  };
  parameters: {
    growthLever: boolean;
  };
  driver: string;
  megaDriver: string;
  status: PLACE_TIMELINE;
  distance?: number;
  duration: number;
  tags?: string[];
  features: any;
}

export interface ISubLivestment {
  score: number;
  placesList: [IPlace];
}

export interface ILivestment {
  livestmentScore: number;
  schools: ISubLivestment;
  hospitals: ISubLivestment;
}

export interface IPlace {
  _id: string;
  placeId: string;
  distance: number;
  timeline: string;
}
export interface IMegaDriverScore {
  score: number;
  megaDriver: string;
  places: [IPlace];
}

export interface IProjectDriver {
  _id: string;
  place: ILivIndexPlaces;
  distance: number;
  mapsDistanceMetres: number;
  mapsDurationSeconds: number;
  coefficients: {
    proximityCoeffecient: number;
    countCoeffecient: number;
    triggerCoeffecient: number;
    timelineCoeffecient: number;
  };
}
export interface IScoreBreakup {
  megaDriver: string;
  drivers: [IProjectDriver];
}

export interface IIntrinsicDriver {
  coefficients: {
    craftCoeffecient: number;
    builderCoeffecient: number;
  };
}

export interface ILivIndexScore {
  score: number;
  summary: string;
  scoreBreakup: [IScoreBreakup];
}

export interface ProjectStructure {
  metadata: ProjectField[];
  ui: ProjectField[];
  land: ProjectField[];
  plots: ProjectField[];
  connectivity: ProjectField[];
  status: ProjectField[];
  basic_infra: ProjectField[];
  amenities: ProjectField[];
  clickToAction: ProjectField[];
  team: ProjectField[];
  livIndexScore: ILivIndexScore;
  relevantDetails?: string;
}
