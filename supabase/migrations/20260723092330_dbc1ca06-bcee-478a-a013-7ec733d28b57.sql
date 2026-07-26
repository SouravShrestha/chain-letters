
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  host_id text not null,
  host_name text not null default 'Host',
  guest_id text,
  guest_name text,
  rounds_total int not null default 1,
  turn_seconds int not null default 15,
  phase text not null default 'lobby',
  current_round int not null default 0,
  start_letter text,
  end_letter text,
  starter_slot text,
  current_turn text,
  turn_ends_at timestamptz,
  used_words text[] not null default '{}',
  host_score int not null default 0,
  guest_score int not null default 0,
  last_result jsonb,
  round_history jsonb not null default '[]'::jsonb,
  rematch_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.sessions to anon, authenticated;
grant all on public.sessions to service_role;
alter table public.sessions enable row level security;
create policy "sessions readable by all" on public.sessions for select to anon, authenticated using (true);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  round int not null,
  player_slot text not null,
  word text not null,
  valid boolean not null,
  reason text,
  created_at timestamptz not null default now()
);
create index submissions_session_round_idx on public.submissions(session_id, round, created_at);
grant select on public.submissions to anon, authenticated;
grant all on public.submissions to service_role;
alter table public.submissions enable row level security;
create policy "submissions readable by all" on public.submissions for select to anon, authenticated using (true);

create table public.letter_picks (
  session_id uuid not null references public.sessions(id) on delete cascade,
  round int not null,
  player_slot text not null,
  letter text not null,
  created_at timestamptz not null default now(),
  primary key (session_id, round, player_slot)
);
grant all on public.letter_picks to service_role;
alter table public.letter_picks enable row level security;
-- No policies: only service_role (bypasses RLS) can access

alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.submissions;
