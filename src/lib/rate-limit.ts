import { NextResponse } from "next/server";

let ratelimit: { limit: (key: string) => Promise<{ success: boolean }> } | null = null;

async function getRatelimit() {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Rate limiting disabled — return a no-op limiter
    ratelimit = { limit: async () => ({ success: true }) };
    return ratelimit;
  }

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");
  const redis = new Redis({ url, token });
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: false,
  });
  return ratelimit;
}

export async function checkRateLimit(
  key: string,
): Promise<{ ok: true } | { ok: false; response: Response }> {
  const limiter = await getRatelimit();
  const { success } = await limiter.limit(key);
  if (!success) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Too many requests" }, { status: 429 }),
    };
  }
  return { ok: true };
}
