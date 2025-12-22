-- Migration: Add Goal Direction Matching
-- Created: 2025-01-XX
-- Description: Adds goal_direction enum and column to user_profiles for matching users with similar goals

-- 1) Enum anlegen
do $$ begin
  create type goal_direction as enum ('freedom','clarity','growth','balance','meaning');
exception
  when duplicate_object then null;
end $$;

-- 2) Spalte auf user_profiles (intern)
alter table public.user_profiles
  add column if not exists goal_direction goal_direction;

-- 3) Index für Filter
create index if not exists idx_user_profiles_goal_direction
  on public.user_profiles(goal_direction);

-- Optional: (wenn ihr schneller filtern wollt) partial index auf public profiles
create index if not exists idx_user_profiles_public_goal_direction
  on public.user_profiles(goal_direction)
  where is_public = true;

COMMENT ON COLUMN public.user_profiles.goal_direction IS 'Internal goal direction category for matching users with similar goals';

