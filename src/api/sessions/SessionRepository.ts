import { getSupabaseAdmin } from "@/integrations/supabase/client.server";
import type { Session } from "@/types/session";
import type { ISessionRepository } from "./ISessionRepository";

export class SessionRepository implements ISessionRepository {
  async findByCode(code: string): Promise<Session | null> {
    const { data, error } = await getSupabaseAdmin()
      .from("sessions")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as unknown as Session | null;
  }

  async findById(id: string): Promise<Session | null> {
    const { data, error } = await getSupabaseAdmin()
      .from("sessions")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data as unknown as Session | null;
  }

  async create(data: {
    code: string;
    host_id: string;
    host_name: string;
    rounds_total?: number;
    turn_seconds?: number;
  }): Promise<Session> {
    const { data: row, error } = await getSupabaseAdmin()
      .from("sessions")
      .insert({ ...data, phase: "lobby" })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Failed to create session");
    return row as unknown as Session;
  }

  async update(id: string, data: Partial<Session>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = { ...data, updated_at: new Date().toISOString() } as any;
    const { error } = await getSupabaseAdmin().from("sessions").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  }

  async updateIfPhase(
    id: string,
    expectedPhase: Session["phase"],
    data: Partial<Session>,
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = { ...data, updated_at: new Date().toISOString() } as any;
    const { data: rows, error } = await getSupabaseAdmin()
      .from("sessions")
      .update(payload)
      .eq("id", id)
      .eq("phase", expectedPhase)
      .select("id");
    if (error) throw new Error(error.message);
    return (rows?.length ?? 0) > 0;
  }

  async delete(id: string): Promise<void> {
    const { error } = await getSupabaseAdmin().from("sessions").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
