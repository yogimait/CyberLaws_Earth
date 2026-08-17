// Supabase client singleton — used when env vars are present.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// A country row as PostgREST hands it back, before the embeds are normalised.
export type CountryRow = Record<string, unknown> & { countryId: string };

// PostgREST embeds a one-to-one relation as an object and a one-to-many as an
// array. Normalise both to a single row so callers never index into an object.
export function firstOf<T>(embedded: T | T[] | null | undefined): T | null {
  if (!embedded) return null;
  return Array.isArray(embedded) ? embedded[0] ?? null : embedded;
}
