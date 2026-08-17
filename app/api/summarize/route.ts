// POST /api/summarize — AI-powered legal summary via Groq.
import { ok, fail, readJson } from "@/lib/http";
import { NextRequest } from "next/server";

function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

export async function POST(request: NextRequest) {
  const body = await readJson<{ countryName?: unknown; crimeTopic?: unknown }>(request);
  if (!body) {
    return fail("INVALID_JSON", {}, "Request body must be valid JSON.", 400);
  }

  const { countryName, crimeTopic } = body;

  if (!countryName || !crimeTopic) {
    return fail(
      "MISSING_FIELDS",
      { required: ["countryName", "crimeTopic"] },
      "Both countryName and crimeTopic are required.",
      400
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fail(
      "AI_NOT_CONFIGURED",
      {},
      "Groq API key not configured. Set GROQ_API_KEY in .env.local",
      503
    );
  }

  try {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are a cyber law expert. Provide concise, accurate legal summaries. Always respond with exactly 3 bullet points, each 1-2 sentences. Be specific about law names, sections, and penalties. Do NOT wrap your response in any tags.",
        },
        {
          role: "user",
          content: `Summarize the cyber laws of ${countryName} specifically regarding: "${crimeTopic}". Include the relevant act/section name, maximum penalty, and whether it's bailable.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const rawSummary = completion.choices[0]?.message?.content ?? "No summary available.";
    const summary = stripThinkTags(rawSummary);

    return ok({ summary, countryName, crimeTopic });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown AI error";
    return fail("AI_SUMMARY_FAILED", { error: message }, "Failed to generate AI summary.", 500);
  }
}
