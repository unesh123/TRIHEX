import {
  ReasoningRequest,
  ReasoningResponse,
  SearchRequest,
  SearchResponse,
} from "./types";
import { getProvidersByCapability } from "./registry";
import { invokeGeminiReasoning } from "./adapters/gemini";
import { invokeOpenAIReasoning } from "./adapters/openai";
import { invokeYouComSearch } from "./adapters/youcom";
import { checkBudgetGuard, recordUsageCost, recordFailoverEvent } from "./budget";

export async function reason(request: ReasoningRequest): Promise<ReasoningResponse> {
  const budget = checkBudgetGuard(5);
  if (!budget.allowed) {
    throw new Error(budget.reason || "External AI budget reached.");
  }

  const reasoningProviders = getProvidersByCapability("LLM_REASONING");

  if (reasoningProviders.length === 0) {
    throw new Error("No reasoning AI providers are currently configured or enabled.");
  }

  let lastError: Error | null = null;

  for (const provider of reasoningProviders) {
    try {
      if (provider.id === "gemini") {
        const response = await invokeGeminiReasoning(request);
        recordUsageCost(response.estimatedCostCents ?? 2, "gemini");
        return response;
      }

      if (provider.id === "openai") {
        const response = await invokeOpenAIReasoning(request);
        recordUsageCost(response.estimatedCostCents ?? 3, "openai");
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[ProviderRouter] Provider ${provider.id} failed, attempting failover:`, err?.message);
      recordFailoverEvent(provider.id, "failover_target", err?.message || "Provider error");
    }
  }

  throw lastError || new Error("All configured reasoning providers failed to respond.");
}

export async function researchSearch(request: SearchRequest): Promise<SearchResponse> {
  const budget = checkBudgetGuard(2);
  if (!budget.allowed) {
    return {
      results: [],
      providerId: "fallback_budget_guard",
      query: request.query,
      durationMs: 0,
    };
  }

  const searchProviders = getProvidersByCapability("WEB_SEARCH");

  for (const provider of searchProviders) {
    if (provider.id === "youcom") {
      try {
        const response = await invokeYouComSearch(request);
        recordUsageCost(2);
        return response;
      } catch (err: any) {
        console.warn(`[ProviderRouter] You.com search failed, falling back:`, err?.message);
      }
    }
  }

  // Graceful fallback when search provider is unavailable/degraded: return empty list or structured baseline
  return {
    results: [
      {
        title: "Nepal Open Data Catalog & Public Feeds",
        url: "https://opendatanepal.com",
        snippet: "Official open dataset portal publishing verified public records and indicators across Nepal.",
        publisher: "Open Data Nepal",
      },
      {
        title: "Nepal Rastra Bank Official Economic Indicators",
        url: "https://www.nrb.org.np",
        snippet: "Authoritative central banking reports, foreign exchange reserves, and monetary policy publications.",
        publisher: "Nepal Rastra Bank",
      },
    ],
    providerId: "civic_open_fallback",
    query: request.query,
    durationMs: 15,
  };
}

export function isAiReady(): boolean {
  const reasoning = getProvidersByCapability("LLM_REASONING");
  return reasoning.length > 0;
}
