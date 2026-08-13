import { z } from "zod";
import { normalizeEnvAliases } from "@/lib/env/normalize-aliases";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER: z.string().optional(),
  NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  POSTGRES_URL: z.string().optional(),
  POSTGRES_URL_NON_POOLING: z.string().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  ADMIN_DEV_BYPASS: z.enum(["true", "false"]).optional(),
  DEMO_MODE: z.enum(["true", "false"]).optional(),
  PERSISTENCE_MODE: z.enum(["postgres", "demo", "test"]).optional(),
  PRODUCT_MEDIA_STORAGE_BUCKET: z.string().optional(),
  PAYMENT_PROOF_STORAGE_BUCKET: z.string().optional(),
  PRIVATE_DOCUMENT_STORAGE_BUCKET: z.string().optional(),
  PAYMENT_QR_STORAGE_BUCKET: z.string().optional(),
  ESEWA_PRODUCT_CODE: z.string().optional(),
  ESEWA_SECRET_KEY: z.string().optional(),
  ESEWA_ENVIRONMENT: z.enum(["test", "production"]).optional(),
  KHALTI_SECRET_KEY: z.string().optional(),
  KHALTI_ENVIRONMENT: z.enum(["test", "production"]).optional(),
  EMAIL_PROVIDER_API_KEY: z.string().optional(),
  YOUCOM_API_KEY: z.string().min(20).optional(),
  EMAIL_FROM: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  ANALYTICS_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  IP_HASH_SALT: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  normalizeEnvAliases();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Environment validation warnings:", parsed.error.flatten().fieldErrors);
    cached = envSchema.parse({
      ...process.env,
      NODE_ENV: process.env.NODE_ENV ?? "development",
    });
    return cached;
  }
  cached = parsed.data;
  return cached;
}

export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const env = getEnv();
  const value = env[key];
  if (value == null || value === "") {
    throw new Error(`Required environment variable ${String(key)} is not set.`);
  }
  return value as NonNullable<Env[K]>;
}

export function isDatabaseConfigured(): boolean {
  normalizeEnvAliases();
  return Boolean(process.env.DATABASE_URL);
}

export function isSupabaseConfigured(): boolean {
  normalizeEnvAliases();
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
