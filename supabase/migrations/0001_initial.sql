-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Subscriptions table
create table subscriptions (
  id text primary key,
  user_id uuid references auth.users not null,
  service_name text not null,
  category text not null,
  start_date date not null,
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'other')),
  amount numeric not null,
  currency text not null check (currency in ('JPY', 'USD', 'EUR', 'GBP')),
  next_billing_date date,
  trial_end_date date,
  cancellation_deadline date,
  payment_card text,
  status text not null check (status in ('active', 'canceling', 'canceled')),
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security: users can only access their own data
alter table subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscriptions"
  on subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscriptions"
  on subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own subscriptions"
  on subscriptions for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row
  execute function update_updated_at();

-- User preferences (for notification settings)
create table user_preferences (
  user_id uuid primary key references auth.users,
  notify_billing_days int default 7,
  notify_trial_days int default 3,
  notify_cancellation_days int default 3,
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_preferences enable row level security;

create policy "Users can manage own preferences"
  on user_preferences
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
