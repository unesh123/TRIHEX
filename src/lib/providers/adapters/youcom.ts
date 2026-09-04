import { SearchRequest, SearchResponse, SearchResultItem } from "../types";
import { getProviderSecret } from "@/lib/env/server";

export async function invokeYouComSearch(request: SearchRequest): Promise<SearchResponse> {
  const secret = getProviderSecret("youcom");
  if (!secret) {
    throw new Error("You.com API key is not configured.");
  }

  const start = Date.now();
  const count = request.count ?? 5;
  const url = `https://api.ydc-index.io/search?query=${encodeURIComponent(request.query)}&count=${count}`;

  const res = await fetch(url, {
    headers: { "X-API-Key": secret },
    signal: AbortSignal.timeout(8000),
  });

  const durationMs = Date.now() - start;

  if (!res.ok) {
    throw new Error(`You.com search failed (HTTP ${res.status})`);
  }

  const data = await res.json();
  const results: SearchResultItem[] = [];

  if (Array.isArray(data?.hits)) {
    for (const hit of data.hits) {
      if (hit?.title && hit?.url) {
        results.push({
          title: String(hit.title).slice(0, 200),
          url: String(hit.url),
          snippet: Array.isArray(hit.snippets) ? hit.snippets.join(" ") : String(hit.description || ""),
          publisher: hit.source || undefined,
        });
      }
    }
  }

  return {
    results,
    providerId: "youcom",
    query: request.query,
    durationMs,
  };
}
