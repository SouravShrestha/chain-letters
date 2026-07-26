# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chain Letters is a real-time 2-player word dueling game. Players pick letters, form word chains (words starting with one letter, ending with another), and race against a timer. Built on Next.js 15 App Router + Supabase Realtime.

## Commands

```sh
npm run dev          # Start local dev server
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier (writes in place)
npx tsc --noEmit     # Type-check without emitting

npm run db:types     # Regenerate Supabase TypeScript types (requires supabase CLI + SUPABASE_PROJECT_ID in .env.local)

# Cloudflare deployment (not used in dev)
npx opennextjs-cloudflare build
npx wrangler pages deploy
```

No test suite exists yet (`npm test` is a no-op).

## Architecture

### Data Flow

Clients are **read-only via Supabase Realtime**; all mutations go through Next.js API routes:

```
Browser
  ├── useRoomSession hook  ← Supabase Realtime (postgres_changes on sessions/submissions)
  ├── gameApi (lib/game-api.ts)  → POST /api/game/* (JSON)
  └── RoomProvider (Context) — owns session + submission state

Next.js API Routes (/api/game/*)
  └── Zod validation → GameService → Repositories → Supabase (service_role)

Supabase (Postgres + Realtime)
  ├── sessions        — game state, phase, scores
  ├── submissions     — word submissions per round
  └── letter_picks    — hidden letter picks (service_role only, never exposed to clients)
```

### Game State Machine

The `phase` field drives all routing. `useRoomSession` auto-navigates to `/room/[code]/[phase]` on Realtime updates:

```
lobby → letter_pick → round → round_result → [next letter_pick | match_summary]
```

### Repository Pattern

**Never query Supabase directly in route handlers or components.** All DB access goes through repository classes in `src/api/`:

- `src/api/sessions/` — `ISessionRepository` / `SessionRepository`
- `src/api/submissions/` — `ISubmissionRepository` / `SubmissionRepository`
- `src/api/letter-picks/` — `ILetterPickRepository` / `LetterPickRepository`
- `src/api/GameService.ts` — pure business logic (`endRound`, `recordTimeout`, `slotOf`)
- `src/api/container.ts` — singleton wiring (no DI framework)

### Server-Only Boundaries

These modules must **never** be imported in client components:

- `src/lib/words.server.ts` — word set loader (uses `globalThis` cache to survive HMR; 248K words from `src/data/words.txt`)
- `src/integrations/supabase/client.server.ts` — admin client (service_role key)

### Player Identity

Anonymous — UUID stored in `localStorage` as `chain_letters_player_id`. No authentication.

### Word Validation (server-side only)

Server checks: alpha-only, correct start/end letters, not already used this round, present in the 248K-word dictionary. The word `Set` is cached on `globalThis` to avoid re-parsing across requests.

> **Cloudflare Workers caveat**: `fs.readFileSync` is unavailable in the CF edge runtime. If deploying to Workers, `words.txt` must be converted to a JS `Set` export (`src/data/words.ts`) or stored in KV. See `src/lib/words.server.ts`.

### Rate Limiting

`src/lib/rate-limit.ts` wraps Upstash Redis with a sliding-window limiter. It is a **no-op when `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are absent** — safe to skip in development.

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useRoomSession.ts` | Core hook: Realtime subscription, auto-join, phase-based routing |
| `src/lib/game-api.ts` | Type-safe fetch wrappers for all `/api/game/*` routes |
| `src/types/session.ts` | Shared types: `Session`, `Submission`, `Slot`, `GamePhase` |
| `src/integrations/supabase/types.ts` | Auto-generated DB types (regenerate with `npm run db:types`) |
| `supabase/migrations/` | Full DB schema (sessions, submissions, letter_picks + RLS policies) |

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, never expose to client

# Optional — rate limiting (disabled automatically if absent)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# For db:types only
SUPABASE_PROJECT_ID=your-project-id
```

## Supabase Setup Requirements

- Run the migration SQL in the Supabase SQL Editor
- Enable Realtime on `sessions` and `submissions` tables (Database → Replication)
- `letter_picks` table is **service_role only** — RLS deliberately hides picks from clients
