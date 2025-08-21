export interface ChatSession {
  sessionId: string;
  startingQuestion: string;
  createdAt: string;
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
}

interface Profile {
  name?: string;
  email?: string;
  city?: string;
  source?: string;
  preferredCallbackTime?: string;
}
