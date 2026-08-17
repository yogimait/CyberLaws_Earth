import { ok, fail } from "@/lib/http";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) return fail("DB_ERROR", {}, "Supabase not configured", 500);
  
  const { data, error } = await supabase.from("countries").select("*");
  if (error) return fail("DB_ERROR", { message: error.message, details: error.details }, error.message, 500);

  return ok({ countries: data, total: data.length });
}
