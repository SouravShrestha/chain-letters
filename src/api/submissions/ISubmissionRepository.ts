import type { Submission } from "@/types/session";

export interface ISubmissionRepository {
  findBySessionAndRound(sessionId: string, round: number): Promise<Submission[]>;
  insert(data: {
    session_id: string;
    round: number;
    player_slot: string;
    word: string;
    valid: boolean;
    reason?: string | null;
  }): Promise<void>;
}
