export interface Effort {
  name: string;
  profile: string;
  date: string;
  effort: string;
  pace: string;
  bpm: string;
  duration: string;
  localRank?: number;
}

export interface Segment {
  name: string;
  id: string;
  type: "run" | "ride";
}

export interface Club {
  name: string;
  linkName: string;
  id: string;
  segments: Segment[];
}

export interface SegmentEffort {
  segment: Segment;
  efforts: Effort[];
}

export interface ClubEfforts {
  club: Club;
  efforts: SegmentEffort[];
}

export interface LeaderboardEffort {
  points: number;
  effort: Effort;
}

export interface Athlete {
  name: string;
  profile: string;
  efforts: {
    [segmentId: string]: LeaderboardEffort;
  };
  totalPoints: number;
  rank: number;
}
