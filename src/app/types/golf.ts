export interface HoleData {
  hole: number;
  par: number;
  score: number;
  fairwayHit: boolean;
  gir: boolean;
  penalty: boolean;
  putts: number;
  chips: number;
  bunkerShots: number;
}

export interface GolfRound {
  id: string;
  date: string;
  course: string;
  score: number;
  par: number;
  courseRating?: number;
  slope?: number;
  fairwaysHit: number;
  fairwaysTotal: number;
  greensInRegulation: number;
  greensTotal: number;
  putts: number;
  totalChips: number;
  totalBunkerShots: number;
  totalPenalties: number;
  eagles: number;
  pars: number;
  birdies: number;
  bogeys: number;
  doubleBogeys: number;
  tripleBogeys: number;
  holes: HoleData[];
  notes?: string;
}

export interface GolfStats {
  averageScore: number;
  bestScore: number;
  averageFairwayAccuracy: number;
  averageGIR: number;
  averagePutts: number;
  totalRounds: number;
  handicap: number;
  handicapMethod?: string;
  averageEagles: number;
  averagePars: number;
  averageBirdies: number;
  averageBogeys: number;
  averageDoubleBogeys: number;
  averageTripleBogeys: number;
  totalEagles: number;
  totalBirdies: number;
  totalPars: number;
  totalBogeys: number;
  totalDoubleBogeys: number;
  totalTripleBogeys: number;
  averageChips: number;
  averagePenalties: number;
}
