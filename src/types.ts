export interface InvitationalEffort {
  name: string;
  profile: string;
  activity: string;
  duration: number;
  localRank?: number;
  invitational: Invitational;
}

export interface InvitationalEffortFromApi {
  name: string;
  profile: string;
  activity: string;
  duration: string;
  localRank?: number;
}

export interface Invitational {
  name: string;
  shortName: string;
  initials: string;
  id: string;
  description: string;
  segment: string;
  type: 'minor' | 'major';
  year: number;
  distance: number;
  elevation?: number;
}

export interface Club {
  name: string;
  linkName: string;
  id: string;
}

export interface ClubEffortsFromApi {
  club: Club;
  invitationalEfforts: {
    invitational: Invitational;
    efforts: InvitationalEffortFromApi[];
  }[];
}

export interface ClubEfforts {
  club: Club;
  invitationalEfforts: InvitationalEffortGroup[];
}

export type InvitationalEffortGroup = {
  invitational: Invitational;
  efforts: InvitationalEffort[];
};

export interface Event {
  name: string;
  date: string;
  description: string;
  stravaLink?: string;
}

export interface LeaderboardInvitationalEffort {
  points: number;
  effort: InvitationalEffort;
}

export interface InvitationalAthlete {
  name: string;
  profile: string;
  efforts: {
    [invitationalId: string]: LeaderboardInvitationalEffort;
  };
  totalPoints: number;
  rank: number;
}

export interface BeermileSignup {
  name: string;
  mail: string;
  timeEstimate: string;
  team?: { teamName: string; teamMembers: { name: string }[] };
}
