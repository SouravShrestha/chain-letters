import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo, gameService } from "@/api/container";

const schema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, playerId } = schema.parse(body);

    const session = await sessionRepo.findById(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
    if (!gameService.slotOf(session, playerId)) {
      return NextResponse.json({ error: "Not in this session" }, { status: 403 });
    }
    if (session.phase !== "round_result") {
      return NextResponse.json({ error: "Not ready for next round" }, { status: 409 });
    }

    // Conditioned on phase still being "round_result" so a duplicate
    // trigger (e.g. RoundResultView's countdown effect firing twice)
    // can't double-increment current_round.
    await sessionRepo.updateIfPhase(sessionId, "round_result", {
      phase: "letter_pick",
      current_round: session.current_round + 1,
      start_letter: null,
      end_letter: null,
      current_turn: null,
      turn_ends_at: null,
      used_words: [],
      last_result: null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
