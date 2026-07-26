import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo } from "@/api/container";

const schema = z.object({
  code: z.string().trim().min(3).max(10),
  playerId: z.string().min(1),
  name: z.string().trim().min(1).max(24),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, playerId, name } = schema.parse(body);

    const session = await sessionRepo.findByCode(code.toUpperCase());
    if (!session) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    if (session.host_id === playerId) {
      return NextResponse.json({ code: session.code, id: session.id });
    }

    if (session.guest_id && session.guest_id !== playerId) {
      return NextResponse.json({ error: "Room is full" }, { status: 409 });
    }

    if (!session.guest_id) {
      await sessionRepo.update(session.id, {
        guest_id: playerId,
        guest_name: name,
      });
    }

    return NextResponse.json({ code: session.code, id: session.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
