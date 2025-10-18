export interface ChatSession {
  sessionId: string;
  startingQuestion: string;
  createdAt: string;
}

export interface UtmEntry {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landingPage?: string;
  capturedAt: Date;
}

export interface User {
  _id: string;
  mobile: string;
  countryCode: string;
  name?: string;
  email?: string;
  status?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
  savedProjects: string[];
  savedLvnzyProjects: any;
  requestedProjects?: string[];
  chatSessions: ChatSession[];
  profile: Profile;
  requestedReports?: {
    projectName: string;
    reraId: string;
  }[];
  metrics?: {
    utm?: UtmEntry[];
  };
}

interface Profile {
  name?: string;
  email?: string;
  city?: string;
  source?: string;
  preferredCallbackTime?: string;
}
