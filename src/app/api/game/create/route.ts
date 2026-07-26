import { NextResponse } from "next/server";
import { z } from "zod";
import { sessionRepo } from "@/api/container";
import { generateCode } from "@/lib/code-generator";

const schema = z.object({
  playerId: z.string().min(1),
  name: z.string().trim().min(1).max(24),
  rounds: z.union([z.literal(1), z.literal(3), z.literal(5)]),
  turnSeconds: process.env.NODE_ENV === "development"
    ? z.union([z.literal(10), z.literal(15), z.literal(30), z.literal(30000)])
    : z.union([z.literal(10), z.literal(15), z.literal(30)]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, name, rounds, turnSeconds } = schema.parse(body);

    for (let attempt = 0; attempt < 6; attempt++) {
      const code = generateCode();
      try {
        const session = await sessionRepo.create({
          code,
          host_id: playerId,
          host_name: name,
          rounds_total: rounds,
          turn_seconds: turnSeconds,
        });
        return NextResponse.json({ code: session.code, id: session.id });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "";
        if (!msg.includes("duplicate")) throw err;
      }
    }

    return NextResponse.json({ error: "Could not allocate a room code" }, { status: 500 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
