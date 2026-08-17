import { ok, fail } from "@/lib/http";
import { supabase, firstOf, type CountryRow } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const countryIds: string[] = body.countryIds;

  if (!Array.isArray(countryIds) || countryIds.length < 2 || countryIds.length > 3) {
    return fail(
      "INVALID_COUNTRY_SELECTION",
      { provided: countryIds?.length ?? 0 },
      "Select 2 or 3 countries for comparison.",
      400
    );
  }

  if (!supabase) return fail("DB_ERROR", {}, "Supabase not configured", 500);

  const { data, error } = await supabase
    .from("countries")
    .select(`
      *,
      draftLaws:draft_laws(*),
      crimesMatrix:crime_matrix(*),
      aiCyberCrimes:ai_cyber_crimes(*)
    `)
    .in("countryId", countryIds);

  if (error || !data || data.length !== countryIds.length) {
    const found = data?.map((c: { countryId: string }) => c.countryId) || [];
    const missing = countryIds.filter((id) => !found.includes(id));
    return fail(
      "COUNTRIES_NOT_FOUND",
      { missing },
      `Countries not found: ${missing.join(", ")}`,
      404
    );
  }

  // Flatten aiCyberCrimes for each country
  const countries = data.map((c: CountryRow) => {
    c.aiCyberCrimes = firstOf(c.aiCyberCrimes);
    return c;
  });

  return ok({ countries, total: countries.length });
}
