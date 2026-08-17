// POST /api/search-law — cyber law Q&A, grounded in live web results.
import { ok, fail, readJson } from "@/lib/http";
import { searchWeb, formatSourcesForPrompt, type WebSource } from "@/lib/serper";
import { NextRequest } from "next/server";

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

const GROUNDED_INSTRUCTION = `You are given WEB SEARCH RESULTS. Base every field on them, prefer the most recent and most official source, and never contradict them. If the results do not cover a field, use your own knowledge but keep the value conservative.`;

const UNGROUNDED_INSTRUCTION = `No web results are available, so answer from your own knowledge.`;

function buildSystemPrompt(sources: WebSource[]): string {
  return `You are a cyber law research assistant. ${
    sources.length > 0 ? GROUNDED_INSTRUCTION : UNGROUNDED_INSTRUCTION
  }

Respond ONLY with valid JSON (no markdown, no explanation, no code fences). Use this exact schema:
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
Output ONLY the JSON object, nothing else.`;
}

export async function POST(request: NextRequest) {
  const body = await readJson<{ query?: unknown }>(request);
  if (!body) {
    return fail("INVALID_JSON", {}, "Request body must be valid JSON.", 400);
  }

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
    // Grounding pass — real sources first, so the model summarises instead of recalling.
    const sources = await searchWeb(`${query} cyber law act penalty section`);

    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: groqKey });

    const userContent =
      sources.length > 0
        ? `WEB SEARCH RESULTS:\n${formatSourcesForPrompt(sources)}\n\nQUESTION: ${query}`
        : query;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: buildSystemPrompt(sources) },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const rawContent = stripThinkTags(completion.choices[0]?.message?.content ?? "{}");
    // Extract JSON from potential markdown fences
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    return ok({
      result: parsedData,
      sources,
      isGrounded: sources.length > 0,
      query,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return fail("SEARCH_FAILED", { error: message }, "Failed to search and analyze.", 500);
  }
}
