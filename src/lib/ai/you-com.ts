import "server-only";

const YOU_COM_SEARCH_ENDPOINT = "https://ydc-index.io/v1/search";

export type YouComSearchResult = {
  title: string;
  url: string;
  description: string | null;
  snippets: string[];
};

export class YouComNotConfiguredError extends Error {
  constructor() {
    super("You.com search is not configured.");
    this.name = "YouComNotConfiguredError";
  }
}

function getApiKey() {
  return process.env.YOUCOM_API_KEY?.trim() || null;
}

export function isYouComConfigured() {
  return Boolean(getApiKey());
}

/**
 * Optional admin research helper. This must never receive checkout, payment,
 * order, quote, email, or phone data—only a manually chosen public research
 * query. The key stays server-side in YOUCOM_API_KEY.
 */
export async function searchPublicWebWithYouCom(input: {
  query: string;
  count?: number;
  country?: string;
  language?: string;
}): Promise<YouComSearchResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new YouComNotConfiguredError();

  const query = input.query.trim().replace(/\s+/g, " ");
  if (!query || query.length > 300) {
    throw new Error("Provide a public research query up to 300 characters.");
  }

  const response = await fetch(YOU_COM_SEARCH_ENDPOINT, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      count: Math.min(Math.max(input.count ?? 5, 1), 10),
      country: input.country ?? "NP",
      language: input.language ?? "en",
      safesearch: "moderate",
    }),
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`You.com search failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    results?: { web?: Array<{ title?: string; url?: string; description?: string; snippets?: string[] }> };
  };

  return (payload.results?.web ?? [])
    .filter((result) => result.title && result.url)
    .map((result) => ({
      title: result.title as string,
      url: result.url as string,
      description: result.description ?? null,
      snippets: Array.isArray(result.snippets) ? result.snippets.slice(0, 3) : [],
    }));
}
