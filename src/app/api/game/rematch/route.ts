import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo } from "@/api/container";
import { generateCode } from "@/lib/code-generator";

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
    if (session.host_id !== playerId) {
      return NextResponse.json({ error: "Only host can start a rematch" }, { status: 403 });
    }
    if (session.phase !== "match_summary") {
      return NextResponse.json({ error: "Match still in progress" }, { status: 409 });
    }

    if (session.rematch_code) {
      const existing = await sessionRepo.findByCode(session.rematch_code);
      if (existing) return NextResponse.json({ code: existing.code, id: existing.id });
    }

    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generateCode();
      try {
        const newSession = await sessionRepo.create({
          code,
          host_id: session.host_id,
          host_name: session.host_name,
        });
        // Wire in guest and preset config, then update
        await sessionRepo.update(newSession.id, {
          guest_id: session.guest_id,
          guest_name: session.guest_name,
          rounds_total: session.rounds_total,
          turn_seconds: session.turn_seconds,
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
        await sessionRepo.update(sessionId, { rematch_code: code });
        return NextResponse.json({ code, id: newSession.id });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("duplicate")) throw err;
      }
    }

    return NextResponse.json({ error: "Could not create rematch" }, { status: 500 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
