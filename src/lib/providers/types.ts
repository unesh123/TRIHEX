export type ProviderCapability =
  | "LLM_GENERAL"
  | "LLM_REASONING"
  | "WEB_SEARCH"
  | "DEEP_RESEARCH"
  | "PAGE_EXTRACTION"
  | "VOICE"
  | "IMAGE_GENERATION"
  | "VIDEO_GENERATION"
  | "MAPS"
  | "PLACES"
  | "GEOCODING"
  | "PUBLIC_DATA";

export type ProviderStatus =
  | "CONFIGURED"
  | "NOT_CONFIGURED"
  | "HEALTHY"
  | "DEGRADED"
  | "RATE_LIMITED"
  | "DISABLED"
  | "ERROR";

export type ProviderCategory =
  | "AI_REASONING"
  | "SEARCH_RESEARCH"
  | "PAGE_EXTRACTION"
  | "SPEECH"
  | "MAPS"
  | "CREATIVE";

export interface ProviderDefinition {
  id: string;
  displayName: string;
  category: ProviderCategory;
  capabilities: ProviderCapability[];
  requiredEnvNames: string[];
  enabled: boolean;
  priority: number; // 1 = highest priority
  timeoutMs: number;
  maxRetries: number;
  costTier: "FREE" | "LOW" | "STANDARD" | "PREMIUM";
  healthStatus: ProviderStatus;
  lastCheckedAt?: string;
  lastLatencyMs?: number;
  lastError?: string;
  notes?: string;
}

export interface ProviderHealthCheckResult {
  providerId: string;
  status: ProviderStatus;
  latencyMs: number;
  statusCode?: number;
  message: string;
  testedAt: string;
}

export interface BudgetLimits {
  perRequestMaxCostCents: number;
  dailyProviderBudgetCents: number;
  maxSearchQueriesPerRequest: number;
  maxPagesFetchedPerRequest: number;
  maxLlmCallsPerRequest: number;
  maxResearchDurationSeconds: number;
}

export interface ReasoningRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
}

export interface ReasoningResponse {
  content: string;
  providerId: string;
  model: string;
  tokensUsed?: number;
  estimatedCostCents?: number;
  durationMs: number;
}

export interface SearchRequest {
  query: string;
  count?: number;
  country?: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  publisher?: string;
  publishedDate?: string;
}

export interface SearchResponse {
  results: SearchResultItem[];
  providerId: string;
  query: string;
  durationMs: number;
}
