export interface LvnzyProject {
  _id: string;
  slug?: string;
  property: any;
  developer: any;
  investment: any;
  meta: any;
  neighborhood: any;
  connectivity: any;
  originalProjectId?: {
    info?: any | null;
    [key: string]: any;
  } | null;
  score: any;
}
