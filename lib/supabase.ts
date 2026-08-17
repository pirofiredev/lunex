import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const schema = (process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || "public") as "public";

/**
 * Browser / client-component client. Safe to import anywhere on the client:
 * uses the public anon key only. Returns null when env vars are not
 * configured yet so local UI work never crashes before Supabase is wired up.
 *
 * Supports custom schema via NEXT_PUBLIC_SUPABASE_SCHEMA env var (e.g., "payload").
 */
export function getSupabaseBrowserClient() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    db: { schema },
  });
}

/**
 * Server-only client for route handlers / server actions that need to
 * bypass row-level security (writing orders, decrementing stock after a
 * Stripe webhook, etc). Never import this from a client component.
 *
 * Supports custom schema via NEXT_PUBLIC_SUPABASE_SCHEMA env var (e.g., "payload").
 */
export function getSupabaseServiceClient() {
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    db: { schema },
  });
}

/**
 * Suggested schema (run in the Supabase SQL editor):
 *
 * create table products (
 *   id uuid primary key default gen_random_uuid(),
 *   slug text unique not null,
 *   name text not null,
 *   category text not null,
 *   price_chf numeric not null,
 *   stripe_price_id text,
 *   description text,
 *   care text[],
 *   sizes text[],
 *   stock jsonb,
 *   images text[],
 *   is_new boolean default false,
 *   drop_id uuid references drops(id)
 * );
 *
 * create table drops (
 *   id uuid primary key default gen_random_uuid(),
 *   slug text unique not null,
 *   name text not null,
 *   release_date timestamptz not null,
 *   description text,
 *   image text
 * );
 *
 * create table orders (
 *   id uuid primary key default gen_random_uuid(),
 *   stripe_session_id text unique not null,
 *   email text,
 *   phone text,
 *   customer_name text,
 *   shipping_address jsonb,
 *   shipping_chf numeric,
 *   line_items jsonb,
 *   total_chf numeric,
 *   status text default 'pending',
 *   created_at timestamptz default now()
 * );
 *
 * create table newsletter_subscribers (
 *   email text primary key,
 *   created_at timestamptz default now()
 * );
 *
 * Row Level Security: enable RLS on every table above. For `products` and
 * `drops`, add a public SELECT policy (see README) so the storefront can
 * read the catalog with the anon key. Leave `orders` and
 * `newsletter_subscribers` with NO public policies — they hold customer
 * PII (address, phone, email) and are only ever written/read using
 * SUPABASE_SERVICE_ROLE_KEY from server-side code (the Stripe webhook),
 * never the anon key.
 */
