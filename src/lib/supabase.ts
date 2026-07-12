/**
 * Supabase client stub — replace with real credentials when backend is ready.
 *
 * Install: npx expo install @supabase/supabase-js
 * Then uncomment the block below and set env variables.
 */

// import { createClient } from '@supabase/supabase-js';
//
// const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
// const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
//
// export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const supabase = null; // remove once real client is wired

/**
 * Expected database schema (Postgres / Supabase):
 *
 * Table: users
 *   id          uuid primary key default gen_random_uuid()
 *   email       text unique not null
 *   name        text
 *   status      text
 *   nationality text
 *   objective   text
 *   duration    text
 *   budget      int
 *   savings     text
 *   created_at  timestamptz default now()
 *
 * Table: plans
 *   id              uuid primary key default gen_random_uuid()
 *   user_id         uuid references users(id) on delete cascade
 *   country_id      text not null
 *   target_month    int
 *   target_year     int
 *   is_explorative  boolean default false
 *   task_statuses   jsonb default '{}'
 *   created_at      timestamptz default now()
 *
 * Table: favorites
 *   user_id     uuid references users(id) on delete cascade
 *   country_id  text not null
 *   primary key (user_id, country_id)
 *
 * Auth: Supabase Auth (email/password or magic link)
 *   → useStore syncs with auth.user after sign in
 *   → plans & favorites fetched from DB, cached in Zustand
 */
