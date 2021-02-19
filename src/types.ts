export interface SegmentEffort {
  name: string;
  profile: string;
  date: string;
  effort: string;
  pace: string;
  bpm: string;
  duration: string;
  localRank?: number;
}

export interface InvitationalEffort {
  name: string;
  profile: string;
  activity: string;
  duration: string;
  localRank?: number;
}

export interface Segment {
  name: string;
  shortName: string;
  initials: string;
  id: string;
  type: 'run' | 'ride';
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
}

export interface Club {
  name: string;
  linkName: string;
  id: string;
  segments: Segment[];
}

export interface ClubEfforts {
  club: Club;
  segmentEfforts: { segment: Segment; efforts: SegmentEffort[] }[];
  invitationalEfforts: {
    invitational: Invitational;
    efforts: InvitationalEffort[];
  }[];
}

export interface LeaderboardSegmentEffort {
  points: number;
  effort: SegmentEffort;
}

export interface LeaderboardInvitationalEffort {
  points: number;
  effort: InvitationalEffort;
}

export interface SegmentAthlete {
  name: string;
  profile: string;
  efforts: {
    [segmentId: string]: LeaderboardSegmentEffort;
  };
  totalPoints: number;
  rank: number;
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
