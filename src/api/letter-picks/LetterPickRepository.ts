import { getSupabaseAdmin } from "@/integrations/supabase/client.server";
import type { ILetterPickRepository } from "./ILetterPickRepository";

export class LetterPickRepository implements ILetterPickRepository {
  async upsert(data: {
    session_id: string;
    round: number;
    player_slot: string;
    letter: string;
  }): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from("letter_picks")
      .upsert(data, { onConflict: "session_id,round,player_slot" });
    if (error) throw new Error(error.message);
  }

  async findBySessionAndRound(
    sessionId: string,
    round: number,
  ): Promise<Array<{ player_slot: string; letter: string }>> {
    const { data, error } = await getSupabaseAdmin()
      .from("letter_picks")
      .select("player_slot,letter")
      .eq("session_id", sessionId)
      .eq("round", round);
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
