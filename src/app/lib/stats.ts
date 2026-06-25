import { GolfRound, GolfStats } from "../types/golf";

export function calculateStats(rounds: GolfRound[]): GolfStats {
  if (rounds.length === 0) {
    return {
      averageScore: 0,
      bestScore: 0,
      averageFairwayAccuracy: 0,
      averageGIR: 0,
      averagePutts: 0,
      totalRounds: 0,
      handicap: 0,
      averageEagles: 0,
      averagePars: 0,
      averageBirdies: 0,
      averageBogeys: 0,
      averageDoubleBogeys: 0,
      averageTripleBogeys: 0,
      totalEagles: 0,
      totalBirdies: 0,
      totalPars: 0,
      totalBogeys: 0,
      totalDoubleBogeys: 0,
      totalTripleBogeys: 0,
      averageChips: 0,
      averagePenalties: 0,
    };
  }

  const totalScore = rounds.reduce((sum, r) => sum + r.score, 0);
  const averageScore = totalScore / rounds.length;
  const bestScore = Math.min(...rounds.map(r => r.score));

  const totalFairways = rounds.reduce((sum, r) => sum + r.fairwaysHit, 0);
  const totalFairwaysPossible = rounds.reduce((sum, r) => sum + r.fairwaysTotal, 0);
  const averageFairwayAccuracy = totalFairwaysPossible > 0
    ? (totalFairways / totalFairwaysPossible) * 100
    : 0;

  const totalGIR = rounds.reduce((sum, r) => sum + r.greensInRegulation, 0);
  const totalGIRPossible = rounds.reduce((sum, r) => sum + r.greensTotal, 0);
  const averageGIR = totalGIRPossible > 0
    ? (totalGIR / totalGIRPossible) * 100
    : 0;

  const totalPutts = rounds.reduce((sum, r) => sum + r.putts, 0);
  const averagePutts = totalPutts / rounds.length;

  const averagePar = rounds.reduce((sum, r) => sum + r.par, 0) / rounds.length;
  const handicap = Math.max(0, Math.round(averageScore - averagePar));

  const avg = (field: keyof typeof rounds[0]) =>
    Math.round((rounds.reduce((sum, r) => sum + (r[field] as number), 0) / rounds.length) * 10) / 10;

  const sum = (field: keyof typeof rounds[0]) =>
    rounds.reduce((s, r) => s + (r[field] as number), 0);

  return {
    averageScore: Math.round(averageScore * 10) / 10,
    bestScore,
    averageFairwayAccuracy: Math.round(averageFairwayAccuracy * 10) / 10,
    averageGIR: Math.round(averageGIR * 10) / 10,
    averagePutts: Math.round(averagePutts * 10) / 10,
    totalRounds: rounds.length,
    handicap,
    averageEagles: avg("eagles"),
    averagePars: avg("pars"),
    averageBirdies: avg("birdies"),
    averageBogeys: avg("bogeys"),
    averageDoubleBogeys: avg("doubleBogeys"),
    averageTripleBogeys: avg("tripleBogeys"),
    totalEagles: sum("eagles"),
    totalBirdies: sum("birdies"),
    totalPars: sum("pars"),
    totalBogeys: sum("bogeys"),
    totalDoubleBogeys: sum("doubleBogeys"),
    totalTripleBogeys: sum("tripleBogeys"),
    averageChips: avg("totalChips"),
    averagePenalties: avg("totalPenalties"),
  };
}
