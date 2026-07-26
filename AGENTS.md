# Chain Letters — Agent Notes

This project has been migrated from Lovable/TanStack Start to **Next.js 15 App Router**.

## Key Architecture Decisions

- **Repository pattern**: All Supabase queries go through `src/api/*/Repository.ts` classes behind interfaces. Do not query Supabase directly in route handlers or components.
- **Server-only modules**: `src/lib/words.server.ts` and `src/integrations/supabase/client.server.ts` must never be imported in client components.
- **Game logic**: All state mutations live in `src/app/api/game/*/route.ts` (server-authoritative). Clients only read via Supabase Realtime.
- **Rate limiting**: `src/lib/rate-limit.ts` wraps Upstash — it's a no-op when env vars are absent (development).

## Word List

`src/data/words.txt` — 248K filtered English words (3–10 chars, lowercase, alpha-only). Sourced from [dwyl/english-words](https://github.com/dwyl/english-words). Loaded server-side only.

> **Cloudflare Workers note**: `fs.readFileSync` is not available in CF edge runtime. If deploying to Workers, convert `words.txt` to a JS `Set` export or use KV.
