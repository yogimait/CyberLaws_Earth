import { createClient } from "@supabase/supabase-js";
import { getAllCountryDetails } from "../lib/data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Supabase Database...");
  const SEED_COUNTRIES = getAllCountryDetails();

  for (const country of SEED_COUNTRIES) {
    console.log(`Processing ${country.countryName}...`);

    // 1. Insert Country
    const { error: countryError } = await supabase
      .from("countries")
      .insert({
        countryId: country.countryId,
        countryName: country.countryName,
        isoCode: country.isoCode,
        flagEmoji: country.flagEmoji,
        geo: country.geo,
        overallStrictnessScore: country.overallStrictnessScore,
        colorCode: country.colorCode,
        primaryAct: country.primaryAct,
        enactedYear: country.enactedYear,
        lastAmendmentYear: country.lastAmendmentYear,
        lawStatus: country.lawStatus,
        enforcementAgency: country.enforcementAgency,
      });

    if (countryError && countryError.code !== '23505') { // Ignore duplicate keys
      console.error(`Failed to insert country ${country.countryName}:`, countryError);
      continue; // Skip the rest if country fails
    }

    // 2. Insert Draft Laws
    if (country.draftLaws.length > 0) {
      const draftLawsData = country.draftLaws.map((law: any) => ({
        countryId: country.countryId,
        billName: law.billName,
        currentStage: law.currentStage,
        isNotified: law.isNotified,
        keyFocus: law.keyFocus
      }));
      const { error: draftError } = await supabase.from("draft_laws").insert(draftLawsData);
      if (draftError) console.error("Draft Laws error:", draftError);
    }

    // 3. Insert Crime Matrix
    if (country.crimesMatrix.length > 0) {
      const crimesData = country.crimesMatrix.map((crime: any) => ({
        countryId: country.countryId,
        categoryId: crime.categoryId,
        crimeName: crime.crimeName,
        legalSection: crime.legalSection,
        maxPrisonTermYears: crime.maxPrisonTermYears,
        maxFineUsd: crime.maxFineUsd,
        isBailable: crime.isBailable,
        strictnessRating: crime.strictnessRating,
        summary: crime.summary
      }));
      const { error: crimeError } = await supabase.from("crime_matrix").insert(crimesData);
      if (crimeError) console.error("Crime Matrix error:", crimeError);
    }

    // 4. Insert AI Cyber Crimes
    if (country.aiCyberCrimes) {
      const aiData = {
        countryId: country.countryId,
        hasDedicatedAiAct: country.aiCyberCrimes.hasDedicatedAiAct,
        aiRegulationsStatus: country.aiCyberCrimes.aiRegulationsStatus,
        deepfakeRules: country.aiCyberCrimes.deepfakeRules,
        voiceCloningAndSyntheticFraud: country.aiCyberCrimes.voiceCloningAndSyntheticFraud
      };
      const { error: aiError } = await supabase.from("ai_cyber_crimes").insert(aiData);
      if (aiError && aiError.code !== '23505') console.error("AI Cyber Crimes error:", aiError);
    }
  }

  console.log("✅ Seeding completed!");
}

seed();
