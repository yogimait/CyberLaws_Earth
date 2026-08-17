// Serper.dev web search — grounds AI legal answers in real, citable sources.

export interface WebSource {
  title: string;
  link: string;
  snippet: string;
}

const SERPER_ENDPOINT = "https://google.serper.dev/search";
const MAX_SOURCES = 5;
const TIMEOUT_MS = 6000;

interface SerperOrganicResult {
  title?: string;
  link?: string;
  snippet?: string;
}

export const isSerperConfigured = Boolean(process.env.SERPER_API_KEY);

// Best-effort: a search failure degrades the answer to ungrounded, never fails
// the request. Returns [] when the key is missing, the call errors, or times out.
export async function searchWeb(query: string): Promise<WebSource[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(SERPER_ENDPOINT, {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: query, num: MAX_SOURCES }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`Serper search failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const payload = (await response.json()) as { organic?: SerperOrganicResult[] };
    return (payload.organic ?? [])
      .filter((result): result is Required<SerperOrganicResult> =>
        Boolean(result.title && result.link && result.snippet)
      )
      .slice(0, MAX_SOURCES)
      .map(({ title, link, snippet }) => ({ title, link, snippet }));
  } catch (error) {
    console.error("Serper search error:", error);
    return [];
  }
}

export function formatSourcesForPrompt(sources: WebSource[]): string {
  return sources
    .map((source, index) => `[${index + 1}] ${source.title}\n${source.snippet}`)
    .join("\n\n");
}
