export type Slot = "host" | "guest";

export type GamePhase =
  | "lobby"
  | "letter_pick"
  | "round"
  | "round_result"
  | "match_summary";

export type Session = {
  id: string;
  code: string;
  host_id: string;
  host_name: string;
  guest_id: string | null;
  guest_name: string | null;
  rounds_total: number;
  turn_seconds: number;
  phase: GamePhase;
  current_round: number;
  start_letter: string | null;
  end_letter: string | null;
  starter_slot: string | null;
  current_turn: string | null;
  turn_ends_at: string | null;
  used_words: string[];
  host_score: number;
  guest_score: number;
  last_result: { winner: string; reason: string; word: string | null } | null;
  round_history: Array<{
    round: number;
    winner: string;
    reason: string;
    word: string | null;
    start_letter: string | null;
    end_letter: string | null;
  }>;
  rematch_code: string | null;
};

export type Submission = {
  id: string;
  session_id: string;
  round: number;
  player_slot: string;
  word: string;
  valid: boolean;
  reason: string | null;
  created_at: string;
};
