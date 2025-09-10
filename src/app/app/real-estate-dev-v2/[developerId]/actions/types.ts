export interface DeveloperProject {
  name: string;
  location: string;
  type: string;
  reraNumber?: number;
  promoterName?: number;
  primaryProject?: number;
}

export interface DeveloperInfo {
  oneLiner?: string;
  management?: string;
  financials?: string;
}

export interface DeveloperGenDetails {
  details: {
    projects?: DeveloperProject[];
  };
}

export interface RealEstateDeveloper {
  name: string;
  info?: DeveloperInfo;
  genDetails?: DeveloperGenDetails;
  developerProjects?: DeveloperProject[];
}

export interface DeveloperActionResult {
  success: boolean;
  data?: RealEstateDeveloper;
  error?: string;
}