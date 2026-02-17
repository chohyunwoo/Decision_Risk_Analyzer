-- Run this once in your Supabase SQL editor.
-- Stores community abuse/takedown reports for moderation and legal response.

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  reason text not null check (reason in ('spam','harassment','copyright','privacy','illegal','other')),
  detail text not null,
  reporter_email text null,
  reporter_ip text null,
  user_agent text null,
  status text not null default 'open' check (status in ('open','reviewing','resolved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  resolution_note text null
);

create index if not exists idx_community_reports_post_id on public.community_reports(post_id);
create index if not exists idx_community_reports_status_created_at on public.community_reports(status, created_at desc);

alter table public.community_reports enable row level security;

-- Block direct client access; only service role (API route) should write/read.
drop policy if exists "community_reports_no_client_access" on public.community_reports;
create policy "community_reports_no_client_access"
on public.community_reports
for all
to authenticated
using (false)
with check (false);
