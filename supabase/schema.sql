-- Purchase Ping schema
-- Apply in Supabase SQL editor. Requires pgcrypto for gen_random_uuid().
create extension if not exists pgcrypto;

-- 1. Profiles -----------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  reminder_returns_enabled boolean not null default true,
  reminder_warranty_enabled boolean not null default true,
  stripe_customer_id text unique,
  plan text not null default 'free' check (plan in ('free','pro')),
  plan_renews_at timestamptz,
  created_at timestamptz not null default now()
);

-- Auto-create profile row on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Categories --------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade, -- null = system default
  name text not null,
  color text not null default '#6366f1'
);

-- Partial unique indexes: NULL user_id (system rows) needs its own index
-- because Postgres treats NULLs as distinct in standard unique constraints.
create unique index if not exists categories_user_name_uniq
  on categories (user_id, name) where user_id is not null;
create unique index if not exists categories_system_name_uniq
  on categories (name) where user_id is null;

insert into categories (user_id, name, color) values
  (null,'Electronics','#6366f1'),
  (null,'Home','#10b981'),
  (null,'Clothing','#ec4899'),
  (null,'Groceries','#f59e0b'),
  (null,'Health','#ef4444'),
  (null,'Travel','#06b6d4'),
  (null,'Subscriptions','#8b5cf6'),
  (null,'Other','#6b7280')
on conflict do nothing;

-- 3. Purchases ---------------------------------------------------------------
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  item_name text not null,
  merchant text,
  order_date date not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  category_id uuid references categories(id) on delete set null,
  return_deadline date,
  warranty_end date,
  notes text,
  receipt_url text,
  receipt_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists purchases_user_order_date_idx
  on purchases (user_id, order_date desc);
create index if not exists purchases_user_return_deadline_idx
  on purchases (user_id, return_deadline) where return_deadline is not null;
create index if not exists purchases_user_warranty_end_idx
  on purchases (user_id, warranty_end) where warranty_end is not null;
create index if not exists purchases_user_category_idx
  on purchases (user_id, category_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists purchases_touch on purchases;
create trigger purchases_touch
  before update on purchases
  for each row execute function public.touch_updated_at();

-- 4. Reminders ---------------------------------------------------------------
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('return','warranty')),
  send_at date not null,
  sent_at timestamptz,
  unique (purchase_id, kind)
);
create index if not exists reminders_due_idx
  on reminders (send_at) where sent_at is null;

-- Auto-create reminder rows when a purchase is inserted/updated
create or replace function public.sync_reminders()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Clear only unsent rows. For an already-sent row whose deadline is
  -- being changed, the ON CONFLICT branch below re-arms it (resets
  -- sent_at and updates send_at) so the user gets a reminder for the
  -- new deadline. The trigger only fires when a deadline column
  -- actually changes, so unrelated edits won't re-arm anything.
  delete from reminders
    where purchase_id = new.id and sent_at is null;
  if new.return_deadline is not null and new.return_deadline > current_date then
    insert into reminders (purchase_id, user_id, kind, send_at)
    values (new.id, new.user_id, 'return', new.return_deadline - interval '3 days')
    on conflict (purchase_id, kind) do update
      set send_at = excluded.send_at,
          sent_at = null
      where reminders.send_at is distinct from excluded.send_at;
  end if;
  if new.warranty_end is not null and new.warranty_end > current_date then
    insert into reminders (purchase_id, user_id, kind, send_at)
    values (new.id, new.user_id, 'warranty', new.warranty_end - interval '14 days')
    on conflict (purchase_id, kind) do update
      set send_at = excluded.send_at,
          sent_at = null
      where reminders.send_at is distinct from excluded.send_at;
  end if;
  return new;
end;
$$;

drop trigger if exists purchases_sync_reminders on purchases;
create trigger purchases_sync_reminders
  after insert or update of return_deadline, warranty_end on purchases
  for each row execute function public.sync_reminders();

-- 5. Billing events ----------------------------------------------------------
create table if not exists billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  stripe_event_id text unique not null,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- 6. Row Level Security ------------------------------------------------------
alter table profiles enable row level security;
alter table purchases enable row level security;
alter table categories enable row level security;
alter table reminders enable row level security;
-- billing_events is service-role only: enable RLS and add no policies
-- so the anon/authenticated roles cannot read or write Stripe payloads.
alter table billing_events enable row level security;

-- Authenticated users can read and update only their own profile row.
-- INSERT is handled by the SECURITY DEFINER handle_new_user trigger;
-- DELETE is handled by the cascade from auth.users.
drop policy if exists "self profile" on profiles;
drop policy if exists "profiles select self" on profiles;
drop policy if exists "profiles update self" on profiles;
create policy "profiles select self" on profiles
  for select using (id = auth.uid());
create policy "profiles update self" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Billing columns must only be writable by the service role (Stripe webhook).
-- RLS row-checks alone can't restrict columns, so we revoke column-level
-- UPDATE on the billing fields from anon and authenticated. The service
-- role bypasses RLS and column grants entirely.
revoke update (stripe_customer_id, plan, plan_renews_at)
  on profiles from anon, authenticated;

drop policy if exists "own purchases" on purchases;
create policy "own purchases" on purchases
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own categories read" on categories;
create policy "own categories read" on categories
  for select using (user_id = auth.uid() or user_id is null);

drop policy if exists "own categories write" on categories;
create policy "own categories write" on categories
  for insert with check (user_id = auth.uid());

drop policy if exists "own reminders" on reminders;
create policy "own reminders" on reminders
  for select using (user_id = auth.uid());
