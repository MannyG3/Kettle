import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Replace with generated types from Supabase CLI when available. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;

let browserClient: SupabaseClient<Database> | null = null;

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, key };
}

/** Use this before calling createSupabaseClient() to avoid throwing when env is missing. */
export function isSupabaseConfigured(): boolean {
  const { url, key } = getEnv();
  return Boolean(url && key);
}

/**
 * Lightweight shared Supabase client creator for both server and client usage.
 * Uses the public anon key; ensure RLS rules are configured correctly in Supabase.
 * Throws if env vars are missing; check isSupabaseConfigured() first when optional.
 */
export function createSupabaseClient(): SupabaseClient<Database> {
  const { url, key } = getEnv();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local. Restart the dev server after adding them."
    );
  }

  // Reuse a single instance in the browser to avoid recreating clients on every render.
  if (typeof window !== "undefined") {
    if (!browserClient) {
      browserClient = createClient<Database>(url, key);
    }
    return browserClient;
  }

  return createClient<Database>(url, key);
}

