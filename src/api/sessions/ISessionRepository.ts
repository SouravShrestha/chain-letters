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
  delete(id: string): Promise<void>;
}
