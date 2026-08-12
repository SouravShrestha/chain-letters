import type { Session } from "@/types/session";

export interface ISessionRepository {
  findByCode(code: string): Promise<Session | null>;
  findById(id: string): Promise<Session | null>;
  create(data: {
    code: string;
    host_id: string;
    host_name: string;
    rounds_total?: number;
    turn_seconds?: number;
  }): Promise<Session>;
  update(id: string, data: Partial<Session>): Promise<void>;
  /**
   * Atomically updates the session only if it is currently in `expectedPhase`.
   * Returns true if the update was applied, false if another concurrent
   * request already moved the session out of `expectedPhase` (no-op).
   */
  updateIfPhase(id: string, expectedPhase: Session["phase"], data: Partial<Session>): Promise<boolean>;
  delete(id: string): Promise<void>;
}
