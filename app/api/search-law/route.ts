// POST /api/search-law — LLM-powered cyber law Q&A.
import { ok, fail } from "@/lib/http";
import { NextRequest } from "next/server";

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

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
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content: `You are a cyber law research assistant. When given a legal question about cyber crimes, respond ONLY with valid JSON (no markdown, no explanation, no code fences). Use this exact schema:
{
  "primaryAct": "Name of Act",
  "legalSection": "Relevant Section",
  "maxPrisonYears": 0,
  "maxFineUsd": 0,
  "isBailable": true,
  "strictnessRating": 5,
  "summary": "Concise 2-3 sentence explanation",
  "isDraftLaw": false
}
Fill in real values based on the user's question. Output ONLY the JSON object, nothing else.`,
        },
        {
          role: "user",
          content: query,
        },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const rawContent = stripThinkTags(completion.choices[0]?.message?.content ?? "{}");
    // Extract JSON from potential markdown fences
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    return ok({ result: parsedData, query });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail("SEARCH_FAILED", { error: message }, "Failed to search and analyze.", 500);
  }
}
