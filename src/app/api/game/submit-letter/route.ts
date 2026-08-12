import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo, letterPickRepo, gameService } from "@/api/container";
import type { Slot } from "@/types/session";

const schema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().min(1),
  letter: z
    .string()
    .trim()
    .length(1)
    .regex(/^[a-zA-Z]$/),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, playerId, letter } = schema.parse(body);

    const session = await sessionRepo.findById(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const slot = gameService.slotOf(session, playerId);
    if (!slot) return NextResponse.json({ error: "Not in this session" }, { status: 403 });
    if (session.phase !== "letter_pick") {
      return NextResponse.json({ error: "Not accepting letters" }, { status: 409 });
    }

    await letterPickRepo.upsert({
      session_id: sessionId,
      round: session.current_round,
      player_slot: slot,
      letter: letter.toUpperCase(),
    });

    const picks = await letterPickRepo.findBySessionAndRound(sessionId, session.current_round);

    if (picks.length === 2) {
      const hostLetter = picks.find((p) => p.player_slot === "host")!.letter;
      const guestLetter = picks.find((p) => p.player_slot === "guest")!.letter;
      const hostStarts = session.current_round % 2 === 1;
      const startLetter = hostStarts ? hostLetter : guestLetter;
      const endLetter = hostStarts ? guestLetter : hostLetter;
      const firstTurn: Slot = hostStarts ? "host" : "guest";
      // Add a 1.5 second grace period to allow clients to receive the event and render the round screen
      const endsAt = new Date(Date.now() + (session.turn_seconds + 1.5) * 1000).toISOString();

      // Conditioned on phase still being "letter_pick" in case both
      // players' submit-letter requests land concurrently after the
      // second pick is recorded.
      await sessionRepo.updateIfPhase(sessionId, "letter_pick", {
        phase: "round",
        start_letter: startLetter,
        end_letter: endLetter,
        starter_slot: firstTurn,
        current_turn: firstTurn,
        turn_ends_at: endsAt,
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
