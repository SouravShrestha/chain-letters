import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { sessionRepo, submissionRepo, gameService } from "@/api/container";
import { getWordSet } from "@/lib/words.server";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Slot } from "@/types/session";

const schema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().min(1),
  word: z.string().trim().min(1).max(40),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const rateCheck = await checkRateLimit(`submit-word:${ip}`);
    if (!rateCheck.ok) return rateCheck.response;

    const body = await request.json();
    const { sessionId, playerId, word: rawWord } = schema.parse(body);

    const session = await sessionRepo.findById(sessionId);
    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const slot = gameService.slotOf(session, playerId);
    if (!slot) return NextResponse.json({ error: "Not in this session" }, { status: 403 });
    if (session.phase !== "round") return NextResponse.json({ error: "Not in a round" }, { status: 409 });
    if (session.current_turn !== slot) return NextResponse.json({ error: "Not your turn" }, { status: 409 });

    // Server-side timer enforcement
    if (session.turn_ends_at && new Date(session.turn_ends_at).getTime() < Date.now()) {
      const winner: Slot = slot === "host" ? "guest" : "host";
      await submissionRepo.insert({ session_id: session.id, round: session.current_round, player_slot: slot, word: "", valid: false, reason: "Time's up" });
      await gameService.endRound(session.id, winner, "Time's up", null);
      return NextResponse.json({ ok: false, reason: "Time's up" });
    }

    const word = rawWord.trim().toLowerCase();
    const startL = (session.start_letter ?? "").toLowerCase();
    const endL = (session.end_letter ?? "").toLowerCase();

    let valid = true;
    let reason: string | null = null;

    if (!/^[a-z]+$/.test(word)) {
      valid = false; reason = "Letters only";
    } else if (word[0] !== startL) {
      valid = false; reason = `Doesn't start with ${startL.toUpperCase()}`;
    } else if (word[word.length - 1] !== endL) {
      valid = false; reason = `Doesn't end with ${endL.toUpperCase()}`;
    } else if ((session.used_words ?? []).includes(word)) {
      valid = false; reason = "Already used this round";
    } else {
      const wordSet = getWordSet();
      if (!wordSet.has(word)) { valid = false; reason = "Not a real word"; }
    }

    if (!valid) {
      // Invalid word: reject without ending the round — player can try again
      return NextResponse.json({ ok: false, reason });
    }

    await submissionRepo.insert({ session_id: session.id, round: session.current_round, player_slot: slot, word, valid, reason });

    const nextTurn: Slot = slot === "host" ? "guest" : "host";
    // Add a 0.5 second grace period to allow the previous word animation to play
    const endsAt = new Date(Date.now() + (session.turn_seconds + 0.5) * 1000).toISOString();
    await sessionRepo.update(session.id, {
      used_words: [...(session.used_words ?? []), word],
      current_turn: nextTurn,
      turn_ends_at: endsAt,
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
