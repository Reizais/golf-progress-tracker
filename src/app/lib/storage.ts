import { GolfRound } from "../types/golf";

const STORAGE_KEY = "golf_rounds";

export function getRounds(): GolfRound[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveRound(round: GolfRound): void {
  const rounds = getRounds();
  rounds.unshift(round);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
}

export function deleteRound(id: string): void {
  const rounds = getRounds().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
}

export function updateRound(updatedRound: GolfRound): void {
  const rounds = getRounds().map(r => r.id === updatedRound.id ? updatedRound : r);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
}

