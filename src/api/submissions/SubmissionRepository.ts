import { getSupabaseAdmin } from "@/integrations/supabase/client.server";
import type { Submission } from "@/types/session";
import type { ISubmissionRepository } from "./ISubmissionRepository";

export class SubmissionRepository implements ISubmissionRepository {
  async findBySessionAndRound(sessionId: string, round: number): Promise<Submission[]> {
    const { data, error } = await getSupabaseAdmin()
      .from("submissions")
      .select("*")
      .eq("session_id", sessionId)
      .eq("round", round)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Submission[];
  }

  async insert(data: {
    session_id: string;
    round: number;
    player_slot: string;
    word: string;
    valid: boolean;
    reason?: string | null;
  }): Promise<void> {
    const { error } = await getSupabaseAdmin().from("submissions").insert(data);
    if (error) throw new Error(error.message);
  }
}
