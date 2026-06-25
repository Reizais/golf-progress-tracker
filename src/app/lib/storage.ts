import { supabase } from "./supabase";
import { GolfRound } from "../types/golf";

export async function getRounds(): Promise<GolfRound[]> {
  const { data, error } = await supabase
    .from("rounds")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching rounds:", error);
    return [];
  }

  return data.map((row) => ({ ...row.data, id: row.id }));
}

export async function saveRound(round: GolfRound): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("rounds").insert({
    id: round.id,
    user_id: user.id,
    date: round.date,
    course: round.course,
    score: round.score,
    data: round,
  });

  if (error) throw error;
}

export async function deleteRound(id: string): Promise<void> {
  const { error } = await supabase.from("rounds").delete().eq("id", id);
  if (error) throw error;
}

export async function updateRound(updatedRound: GolfRound): Promise<void> {
  const { error } = await supabase
    .from("rounds")
    .update({
      date: updatedRound.date,
      course: updatedRound.course,
      score: updatedRound.score,
      data: updatedRound,
    })
    .eq("id", updatedRound.id);

  if (error) throw error;
}
