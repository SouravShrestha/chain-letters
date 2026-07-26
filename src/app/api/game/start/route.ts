import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo } from "@/api/container";

const schema = z.object({
  sessionId: z.string().min(1),
  playerId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, playerId } = schema.parse(body);

    const session = await sessionRepo.findById(sessionId);
    if (!session) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    if (session.host_id !== playerId) {
      return NextResponse.json({ error: "Only host can start the game" }, { status: 403 });
    }

    if (!session.guest_id) {
      return NextResponse.json({ error: "Cannot start without an opponent" }, { status: 400 });
    }

    if (session.phase === "lobby") {
      await sessionRepo.update(session.id, {
        phase: "letter_pick",
        current_round: 1,
        start_letter: null,
        end_letter: null,
        starter_slot: null,
        current_turn: null,
        turn_ends_at: null,
        used_words: [],
        last_result: null,
      });
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
