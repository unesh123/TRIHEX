/**
 * Server-side admin system health — never infer DB state from client env.
 * Do not expose secrets, URLs with credentials, or key values.
 */

import { getDb } from "@/db";
import { isDatabaseConfigured } from "@/lib/env";
import { sql } from "drizzle-orm";
import {
  isProductMediaStorageConfigured,
  isStorageConfigured,
} from "@/lib/storage/adapter";
import { getWhatsAppDisplay } from "@/lib/whatsapp";

export type HealthState = "ok" | "attention" | "unavailable";

export interface SystemHealth {
  environment: "production" | "preview" | "development";
  demoMode: boolean;
  database: HealthState;
  authentication: HealthState;
  productMedia: HealthState;
  paymentProofStorage: HealthState;
  whatsapp: HealthState;
  labels: {
    database: string;
    authentication: string;
    productMedia: string;
    paymentProofStorage: string;
    whatsapp: string;
    environment: string;
  };
}

function resolveEnvironment(): SystemHealth["environment"] {
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";
  if (process.env.NODE_ENV === "production") return "production";
  return "development";
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const environment = resolveEnvironment();
  const demoMode =
    process.env.TRIHEX_DEMO_MODE === "true" ||
    process.env.TRIHEX_DEMO_MODE === "1";

  let database: HealthState = "unavailable";
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      if (db) {
        await db.execute(sql`select 1`);
        database = "ok";
      }
    } catch {
      database = "unavailable";
    }
  }

  const authConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const authentication: HealthState = authConfigured ? "ok" : "unavailable";

  const productMedia: HealthState = isProductMediaStorageConfigured()
    ? "ok"
    : "attention";

  const paymentProofStorage: HealthState =
    isStorageConfigured() && process.env.PAYMENT_PROOF_STORAGE_BUCKET
      ? "ok"
      : "attention";

  let whatsapp: HealthState = "attention";
  try {
    const display = getWhatsAppDisplay();
    if (display && /\d{8,}/.test(display.replace(/\D/g, ""))) {
      whatsapp = "ok";
    }
  } catch {
    whatsapp = "attention";
  }

  const label = (s: HealthState, ok: string, att: string, bad: string) =>
    s === "ok" ? ok : s === "attention" ? att : bad;

  return {
    environment,
    demoMode,
    database,
    authentication,
    productMedia,
    paymentProofStorage,
    whatsapp,
    labels: {
      database: label(database, "Connected", "Needs attention", "Unavailable"),
      authentication: label(
        authentication,
        "Configured",
        "Needs attention",
        "Unavailable",
      ),
      productMedia: label(
        productMedia,
        "Configured",
        "Needs attention",
        "Unavailable",
      ),
      paymentProofStorage: label(
        paymentProofStorage,
        "Configured",
        "Needs attention",
        "Unavailable",
      ),
      whatsapp: label(
        whatsapp,
        "Configured",
        "Needs attention",
        "Unavailable",
      ),
      environment:
        environment === "production"
          ? "Production"
          : environment === "preview"
            ? "Preview"
            : "Development",
    },
  };
}

/** Financial mutations must fail closed when DB is down. */
export function assertDbHealthyForFinance(health: SystemHealth): void {
  if (health.database !== "ok") {
    throw new Error(
      "Database unavailable — financial actions are blocked until connectivity is restored.",
    );
  }
}
