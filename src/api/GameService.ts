import type { Session, Slot } from "@/types/session";
import type { ISessionRepository } from "@/api/sessions/ISessionRepository";
import type { ISubmissionRepository } from "@/api/submissions/ISubmissionRepository";

/**
 * Shared game business logic — used by API route handlers.
 * Keeps all state mutation in one place, independent of the HTTP layer.
 */
export class GameService {
  constructor(
    private sessions: ISessionRepository,
    private submissions: ISubmissionRepository,
  ) {}

  slotOf(session: Session, playerId: string): Slot | null {
    if (session.host_id === playerId) return "host";
    if (session.guest_id === playerId) return "guest";
    return null;
  }

  async endRound(sessionId: string, winner: Slot, reason: string, word: string | null) {
    const session = await this.sessions.findById(sessionId);
    if (!session) throw new Error("Session not found");

    const host_score = winner === "host" ? session.host_score + 1 : session.host_score;
    const guest_score = winner === "guest" ? session.guest_score + 1 : session.guest_score;

    const history = Array.isArray(session.round_history) ? [...session.round_history] : [];
    history.push({
      round: session.current_round,
      winner,
      reason,
      word,
      start_letter: session.start_letter,
      end_letter: session.end_letter,
    });

    const roundsPlayed = session.current_round;
    const target = session.rounds_total;
    const majority = Math.floor(target / 2) + 1;
    const done =
      host_score >= majority ||
      guest_score >= majority ||
      (roundsPlayed >= target && host_score !== guest_score);

    await this.sessions.update(sessionId, {
      phase: "round_result",
      host_score,
      guest_score,
      last_result: { winner, reason, word },
      round_history: history as Session["round_history"],
      current_turn: null,
      turn_ends_at: null,
    });

    if (done) {
      await this.sessions.update(sessionId, { phase: "match_summary" });
    }
  }

  async recordTimeout(session: Session) {
    if (session.phase !== "round" || !session.current_turn || !session.turn_ends_at) return;
    if (new Date(session.turn_ends_at).getTime() >= Date.now()) return;

    const loser = session.current_turn as Slot;
    const winner: Slot = loser === "host" ? "guest" : "host";

    await this.submissions.insert({
      session_id: session.id,
      round: session.current_round,
      player_slot: loser,
      word: "",
      valid: false,
      reason: "Time's up",
    });
    await this.endRound(session.id, winner, "Time's up", null);
  }
}
