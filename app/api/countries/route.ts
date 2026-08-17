import { ok, fail } from "@/lib/http";
import { supabase, firstOf, type CountryRow } from "@/lib/supabase";

export async function GET() {
  if (!supabase) return fail("DB_ERROR", {}, "Supabase not configured", 500);
  
  const { data, error } = await supabase.from("countries").select("*, aiCyberCrimes:ai_cyber_crimes(*)");
  if (error) return fail("DB_ERROR", { message: error.message, details: error.details }, error.message, 500);

  const countries = data.map((c: CountryRow) => {
    c.aiCyberCrimes = firstOf(c.aiCyberCrimes);
    return c;
  });

  return ok({ countries, total: countries.length });
}
