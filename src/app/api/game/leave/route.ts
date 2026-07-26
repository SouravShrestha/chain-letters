import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo } from "@/api/container";

const schema = z.object({
  sessionId: z.string().uuid(),
  playerId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, playerId } = schema.parse(body);

    const session = await sessionRepo.findById(sessionId);
    if (!session) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    // Only a participant in this session may delete it.
    const isParticipant = session.host_id === playerId || session.guest_id === playerId;
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Any participant leaving intentionally deletes the room for everyone.
    await sessionRepo.delete(session.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
