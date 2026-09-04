import { normalizeEnvAliases, envPresence, type EnvPresence } from "./normalize-aliases";

if (typeof window !== "undefined") {
  throw new Error("SERVER_ENV_LEAK: @/lib/env/server must never be imported in client-side code or browser bundles.");
}

// Normalize aliases upon module load
normalizeEnvAliases();

export interface ServerEnvConfig {
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  AUTH_SECRET?: string;
  CRON_SECRET?: string;
  FULFILLMENT_SIGNING_SECRET?: string;
  ANALYTICS_HASH_SECRET?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  YOUCOM_API_KEY?: string;
  ZYTE_API_KEY?: string;
  AZURE_SPEECH_KEY?: string;
  AZURE_SPEECH_REGION?: string;
  GOOGLE_MAPS_SERVER_KEY?: string;
  FREEPIK_API_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  NODE_ENV: "development" | "test" | "production";
}

export function getServerEnv(): ServerEnvConfig {
  normalizeEnvAliases();
  return {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    FULFILLMENT_SIGNING_SECRET: process.env.FULFILLMENT_SIGNING_SECRET,
    ANALYTICS_HASH_SECRET: process.env.ANALYTICS_HASH_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    YOUCOM_API_KEY: process.env.YOUCOM_API_KEY,
    ZYTE_API_KEY: process.env.ZYTE_API_KEY,
    AZURE_SPEECH_KEY: process.env.AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION: process.env.AZURE_SPEECH_REGION,
    GOOGLE_MAPS_SERVER_KEY: process.env.GOOGLE_MAPS_SERVER_KEY,
    FREEPIK_API_KEY: process.env.FREEPIK_API_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NODE_ENV: (process.env.NODE_ENV as any) || "development",
  };
}

/**
 * Resolves a sensitive provider secret strictly on the server using canonical names and aliases.
 * Never stores or returns secrets to client code.
 */
export function getProviderSecret(providerId: string): string | undefined {
  normalizeEnvAliases();
  const normalized = providerId.trim().toLowerCase();

  switch (normalized) {
    case "gemini":
    case "google":
    case "google_ai":
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    case "openai":
      return process.env.OPENAI_API_KEY;

    case "youcom":
    case "you_com":
    case "ydc":
      return process.env.YOUCOM_API_KEY || process.env.YDC_API_KEY;

    case "deepseek":
      return process.env.DEEPSEEK_API_KEY;

    case "zyte":
      return process.env.ZYTE_API_KEY;

    case "azure_speech":
    case "azure":
      return process.env.AZURE_SPEECH_KEY;

    case "google_maps":
    case "maps_server":
      return process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY;

    case "freepik":
      return process.env.FREEPIK_API_KEY;

    default:
      return undefined;
  }
}

/**
 * Returns metadata-only status whether a provider has configured credentials.
 * Never leaks the key string.
 */
export function isProviderConfigured(providerId: string): boolean {
  const secret = getProviderSecret(providerId);
  return Boolean(secret && secret.trim().length > 0);
}

/**
 * Metadata presence check for diagnostic dashboards.
 */
export function checkSecretPresence(varName: string): EnvPresence {
  return envPresence(varName);
}
