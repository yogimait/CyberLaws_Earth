// POST /api/search-law — web search + LLM extraction for legal queries.
import { ok, fail } from "@/lib/http";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query } = body;

  if (!query || typeof query !== "string") {
    return fail("MISSING_QUERY", {}, "A search query string is required.", 400);
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return fail(
      "AI_NOT_CONFIGURED",
      {},
      "Groq API key not configured. Set GROQ_API_KEY in .env.local",
      503
    );
  }

  try {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: groqKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a cyber law research assistant. When given a legal question about cyber crimes, provide a structured JSON response. Always respond with valid JSON matching this schema:
{
  "primaryAct": "Name of Act",
  "legalSection": "Relevant Section",
  "maxPrisonYears": number,
  "maxFineUsd": number,
  "isBailable": boolean,
  "strictnessRating": number (1-10),
  "summary": "3-bullet point simple explanation",
  "isDraftLaw": boolean
}`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const rawContent = completion.choices[0]?.message?.content ?? "{}";
    const parsedData = JSON.parse(rawContent);

    return ok({ result: parsedData, query });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail("SEARCH_FAILED", { error: message }, "Failed to search and analyze.", 500);
  }
}
