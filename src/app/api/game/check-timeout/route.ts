import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo, submissionRepo, gameService } from "@/api/container";
import type { Slot } from "@/types/session";

const schema = z.object({ sessionId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = schema.parse(body);

    const session = await sessionRepo.findById(sessionId);
    if (!session) return NextResponse.json({ ok: true });
    if (session.phase !== "round" || !session.current_turn || !session.turn_ends_at) {
      return NextResponse.json({ ok: true });
    }

    if (new Date(session.turn_ends_at).getTime() < Date.now()) {
      const loser = session.current_turn as Slot;
      const winner: Slot = loser === "host" ? "guest" : "host";
      await submissionRepo.insert({
        session_id: session.id,
        round: session.current_round,
        player_slot: loser,
        word: "",
        valid: false,
        reason: "Time's up",
      });
      await gameService.endRound(session.id, winner, "Time's up", null);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
