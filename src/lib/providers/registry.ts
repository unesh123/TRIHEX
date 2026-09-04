import { ProviderDefinition, ProviderCapability, ProviderCategory } from "./types";
import { isProviderConfigured } from "@/lib/env/server";

export const BASE_PROVIDERS: ProviderDefinition[] = [
  {
    id: "gemini",
    displayName: "Google Gemini AI",
    category: "AI_REASONING",
    capabilities: ["LLM_GENERAL", "LLM_REASONING", "DEEP_RESEARCH"],
    requiredEnvNames: ["GEMINI_API_KEY"],
    enabled: true,
    priority: 1, // Primary reasoning model
    timeoutMs: 8000,
    maxRetries: 2,
    costTier: "STANDARD",
    healthStatus: "HEALTHY",
    notes: "Primary reasoning & research engine for TRIHEX Digital OS",
  },
  {
    id: "openai",
    displayName: "OpenAI GPT-4o",
    category: "AI_REASONING",
    capabilities: ["LLM_GENERAL", "LLM_REASONING"],
    requiredEnvNames: ["OPENAI_API_KEY"],
    enabled: true,
    priority: 2, // Secondary / fallback
    timeoutMs: 8000,
    maxRetries: 1,
    costTier: "PREMIUM",
    healthStatus: "CONFIGURED",
    notes: "Secondary LLM adapter (requires key rotation if returning 401)",
  },
  {
    id: "deepseek",
    displayName: "DeepSeek R1",
    category: "AI_REASONING",
    capabilities: ["LLM_REASONING"],
    requiredEnvNames: ["DEEPSEEK_API_KEY"],
    enabled: false,
    priority: 3,
    timeoutMs: 12000,
    maxRetries: 1,
    costTier: "LOW",
    healthStatus: "NOT_CONFIGURED",
    notes: "Specialized open-weights reasoning architecture",
  },
  {
    id: "youcom",
    displayName: "You.com (YDC Index)",
    category: "SEARCH_RESEARCH",
    capabilities: ["WEB_SEARCH", "DEEP_RESEARCH"],
    requiredEnvNames: ["YOUCOM_API_KEY", "YDC_API_KEY"],
    enabled: true,
    priority: 1,
    timeoutMs: 6000,
    maxRetries: 1,
    costTier: "STANDARD",
    healthStatus: "CONFIGURED",
    notes: "Live web indexing and factual citation retrieval",
  },
  {
    id: "zyte",
    displayName: "Zyte Web Extraction",
    category: "PAGE_EXTRACTION",
    capabilities: ["PAGE_EXTRACTION"],
    requiredEnvNames: ["ZYTE_API_KEY"],
    enabled: false,
    priority: 2,
    timeoutMs: 10000,
    maxRetries: 1,
    costTier: "STANDARD",
    healthStatus: "NOT_CONFIGURED",
    notes: "Structured HTML article and vendor terms extraction",
  },
  {
    id: "azure_speech",
    displayName: "Azure AI Speech",
    category: "SPEECH",
    capabilities: ["VOICE"],
    requiredEnvNames: ["AZURE_SPEECH_KEY", "AZURE_SPEECH_REGION"],
    enabled: true,
    priority: 1,
    timeoutMs: 5000,
    maxRetries: 1,
    costTier: "STANDARD",
    healthStatus: "CONFIGURED",
    notes: "Neural voice synthesis and audio generation",
  },
  {
    id: "google_maps",
    displayName: "Google Maps Platform",
    category: "MAPS",
    capabilities: ["MAPS", "PLACES", "GEOCODING"],
    requiredEnvNames: ["GOOGLE_MAPS_SERVER_KEY", "NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY"],
    enabled: true,
    priority: 1,
    timeoutMs: 4000,
    maxRetries: 1,
    costTier: "STANDARD",
    healthStatus: "NOT_CONFIGURED",
    notes: "National Nepal geospatial rendering, places search, and geocoding",
  },
  {
    id: "freepik",
    displayName: "Freepik Creative API",
    category: "CREATIVE",
    capabilities: ["IMAGE_GENERATION"],
    requiredEnvNames: ["FREEPIK_API_KEY"],
    enabled: false,
    priority: 1,
    timeoutMs: 15000,
    maxRetries: 1,
    costTier: "PREMIUM",
    healthStatus: "NOT_CONFIGURED",
    notes: "Future product artwork and social banner generator",
  },
];

// In-memory runtime state for health and enable/disable toggles
let runtimeProviders: ProviderDefinition[] = [...BASE_PROVIDERS];

export function getRegisteredProviders(): ProviderDefinition[] {
  return runtimeProviders.map((p) => {
    const configured = isProviderConfigured(p.id);
    return {
      ...p,
      healthStatus: !configured ? "NOT_CONFIGURED" : p.healthStatus,
    };
  });
}

export function getProviderById(id: string): ProviderDefinition | undefined {
  const providers = getRegisteredProviders();
  return providers.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export function getProvidersByCategory(category: ProviderCategory): ProviderDefinition[] {
  return getRegisteredProviders().filter((p) => p.category === category);
}

export function getProvidersByCapability(capability: ProviderCapability): ProviderDefinition[] {
  return getRegisteredProviders()
    .filter((p) => p.enabled && p.capabilities.includes(capability))
    .sort((a, b) => a.priority - b.priority);
}

export function updateProviderStatus(
  id: string,
  update: Partial<Pick<ProviderDefinition, "healthStatus" | "lastCheckedAt" | "lastLatencyMs" | "lastError" | "enabled">>
): void {
  runtimeProviders = runtimeProviders.map((p) => {
    if (p.id.toLowerCase() === id.toLowerCase()) {
      return { ...p, ...update };
    }
    return p;
  });
}
