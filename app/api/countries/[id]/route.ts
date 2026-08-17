import { ok, fail } from "@/lib/http";
import { supabase, firstOf } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!supabase) return fail("DB_ERROR", {}, "Supabase not configured", 500);

  const { data, error } = await supabase
    .from("countries")
    .select(`
      *,
      draftLaws:draft_laws(*),
      crimesMatrix:crime_matrix(*),
      aiCyberCrimes:ai_cyber_crimes(*)
    `)
    .eq("countryId", id)
    .single();

  if (error || !data) {
    return fail("COUNTRY_NOT_FOUND", { countryId: id }, `Country '${id}' not found.`, 404);
  }

  data.aiCyberCrimes = firstOf(data.aiCyberCrimes);

  return ok(data);
}
