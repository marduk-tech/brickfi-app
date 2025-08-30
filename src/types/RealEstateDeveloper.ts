export interface DeveloperProject {
  name: string;
  reraNumber: number;
  promoterName: number;
  primaryProject: number;
}


export interface RealEstateDeveloper {
  name: string;
  developerProjects: DeveloperProject[];
  genDetails: any;
  info: any;
}