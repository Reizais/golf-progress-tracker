import { GolfRound, GolfStats } from "../types/golf";

/**
 * WHS Score Differential formula:
 * (Adjusted Gross Score - Course Rating) x 113 / Slope Rating
 *
 * Handicap Index = Average of best 8 differentials from last 20 rounds x 0.96
 * Falls back to simple estimate if course rating/slope not available.
 */

export function calculateScoreDifferential(
  score: number,
  courseRating: number,
  slope: number
): number {
  return parseFloat(((score - courseRating) * 113 / slope).toFixed(1));
}

export function calculateWHSHandicap(rounds: GolfRound[]): number {
  if (rounds.length === 0) return 0;

  // Use last 20 rounds
  const recent = rounds.slice(0, 20);

  // Calculate differentials for rounds that have course rating + slope
  const differentials = recent
    .filter(r => r.courseRating && r.slope)
    .map(r => calculateScoreDifferential(r.score, r.courseRating!, r.slope!));

  // Fallback: if fewer than 3 rounds have rating/slope, use simple estimate
  if (differentials.length < 3) {
    const avgScore = rounds.reduce((s, r) => s + r.score, 0) / rounds.length;
    const avgPar = rounds.reduce((s, r) => s + r.par, 0) / rounds.length;
    return Math.max(0, Math.round((avgScore - avgPar) * 10) / 10);
  }

  // WHS: number of best differentials to use based on rounds available
  const count = differentials.length;
  let bestCount: number;
  if (count <= 3)       bestCount = 1;
  else if (count <= 4)  bestCount = 1;
  else if (count <= 5)  bestCount = 1;
  else if (count <= 6)  bestCount = 2;
  else if (count <= 7)  bestCount = 2;
  else if (count <= 8)  bestCount = 2;
  else if (count <= 9)  bestCount = 3;
  else if (count <= 10) bestCount = 3;
  else if (count <= 11) bestCount = 4;
  else if (count <= 12) bestCount = 4;
  else if (count <= 13) bestCount = 5;
  else if (count <= 14) bestCount = 5;
  else if (count <= 15) bestCount = 6;
  else if (count <= 16) bestCount = 6;
  else if (count <= 17) bestCount = 7;
  else if (count <= 18) bestCount = 7;
  else if (count <= 19) bestCount = 8;
  else                  bestCount = 8;

  const sorted = [...differentials].sort((a, b) => a - b);
  const best = sorted.slice(0, bestCount);
  const avg = best.reduce((s, d) => s + d, 0) / best.length;

  // Apply 0.96 multiplier and cap at 54.0
  const handicapIndex = Math.min(54.0, Math.round(avg * 0.96 * 10) / 10);
  return Math.max(0, handicapIndex);
}

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
      handicapMethod: "WHS",
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
    ? (totalFairways / totalFairwaysPossible) * 100 : 0;

  const totalGIR = rounds.reduce((sum, r) => sum + r.greensInRegulation, 0);
  const totalGIRPossible = rounds.reduce((sum, r) => sum + r.greensTotal, 0);
  const averageGIR = totalGIRPossible > 0
    ? (totalGIR / totalGIRPossible) * 100 : 0;

  const totalPutts = rounds.reduce((sum, r) => sum + r.putts, 0);
  const averagePutts = totalPutts / rounds.length;

  // Determine if WHS can be used (at least 3 rounds with rating/slope)
  const roundsWithRating = rounds.filter(r => r.courseRating && r.slope);
  const handicapMethod = roundsWithRating.length >= 3 ? "WHS" : "Estimated";
  const handicap = calculateWHSHandicap(rounds);

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
    handicapMethod,
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
