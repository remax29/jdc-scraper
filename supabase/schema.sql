-- ============================================================
-- JDC Tech Solutions — BYOK Scraper — Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  use_case text,
  segment text check (segment in ('corporate', 'solo')),
  is_admin boolean default false,
  marketing_opt_in boolean default false,
  unsubscribed boolean default false,
  created_at timestamptz default now()
);

-- Mode B only: encrypted key storage
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null,
  ciphertext text not null,
  iv text not null,
  created_at timestamptz default now()
);

create table runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  keywords text[],
  lead_count int default 0,
  status text not null default 'pending', -- 'pending' | 'done' | 'error'
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  company text,
  contact_name text,
  title text,
  email text,
  email_status text,
  source_url text,
  created_at timestamptz default now()
);

create table email_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id),
  subject text not null,
  body text not null,
  target_segment text,
  sent_count int default 0,
  created_at timestamptz default now()
);

create table email_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references email_campaigns(id) on delete cascade,
  recipient_id uuid references auth.users(id),
  status text check (status in ('sent', 'failed', 'skipped_opt_out')),
  sent_at timestamptz default now()
);

create table keepalive (
  id bigserial primary key,
  pinged_at timestamptz default now()
);

create table in_app_messages (
  id uuid primary key default gen_random_uuid(),
  title text,
  body text not null,
  cta_label text,
  cta_url text,
  placement text check (placement in ('dashboard', 'results', 'landing', 'all')),
  target_segment text check (target_segment in ('corporate', 'solo', 'all')),
  active boolean default true,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table optin_incentive (
  id uuid primary key default gen_random_uuid(),
  active boolean default true,
  percent_off int,
  promo_code text,
  description text,
  updated_at timestamptz default now()
);

create table issued_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  promo_code text,
  percent_off int,
  issued_at timestamptz default now(),
  redeemed_at timestamptz
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table api_keys enable row level security;
alter table runs enable row level security;
alter table leads enable row level security;
alter table email_campaigns enable row level security;
alter table email_sends enable row level security;
alter table keepalive enable row level security;
alter table in_app_messages enable row level security;
alter table optin_incentive enable row level security;
alter table issued_codes enable row level security;

-- Admin helper: SECURITY DEFINER bypasses RLS when checking is_admin,
-- preventing infinite recursion in policies that query profiles.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from profiles where id = auth.uid()),
    false
  );
$$;

-- profiles: users read/update their own; admins read all
create policy "users read own profile"
  on profiles for select using (id = auth.uid());

create policy "users update own profile"
  on profiles for update using (id = auth.uid());

create policy "admins read all profiles"
  on profiles for select using (is_admin());

-- api_keys: own rows only
create policy "users manage own api_keys"
  on api_keys for all using (user_id = auth.uid());

-- runs: own rows only
create policy "users manage own runs"
  on runs for all using (user_id = auth.uid());

-- leads: own rows only
create policy "users manage own leads"
  on leads for all using (user_id = auth.uid());

-- email_campaigns: admin write, admin read
create policy "admins manage campaigns"
  on email_campaigns for all using (is_admin());

-- email_sends: admin only
create policy "admins manage email_sends"
  on email_sends for all using (is_admin());

-- keepalive: service role only (via cron API route with service key)
create policy "service role manages keepalive"
  on keepalive for all using (false);

-- in_app_messages: public read active rows; admin write
create policy "public read active messages"
  on in_app_messages for select using (active = true);

create policy "admins manage messages"
  on in_app_messages for all using (is_admin());

-- optin_incentive: public read active row; admin write
create policy "public read active incentive"
  on optin_incentive for select using (active = true);

create policy "admins manage incentive"
  on optin_incentive for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin));

-- issued_codes: own rows only
create policy "users manage own issued_codes"
  on issued_codes for all using (user_id = auth.uid());

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- Seed: default opt-in incentive (edit from admin panel)
-- ============================================================

insert into optin_incentive (active, percent_off, promo_code, description)
values (true, 15, 'OPTIN15', 'Get 15% off JDC automation & SMM service when you sign up for updates.');
