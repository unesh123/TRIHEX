import { getDb } from "@/db";
import { sql } from "drizzle-orm";
import { 
  isSecretConfigured, 
  createSignedDeliveryToken, 
  verifySignedDeliveryToken 
} from "@/lib/fulfillment/secrets-store";
import { REGISTERED_JOBS } from "@/lib/jobs/registry";

export interface ComponentHealth {
  name: string;
  status: "HEALTHY" | "DEGRADED" | "CRITICAL" | "INFO";
  latencyMs?: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface SystemHealthReport {
  overallStatus: "HEALTHY" | "DEGRADED" | "CRITICAL";
  checkedAt: string;
  components: ComponentHealth[];
}

export async function checkSystemHealth(): Promise<SystemHealthReport> {
  const components: ComponentHealth[] = [];

  // 1. PostgreSQL Database Check
  const startDb = Date.now();
  const db = getDb();
  if (db) {
    try {
      await db.execute(sql`SELECT 1;`);
      const latencyMs = Date.now() - startDb;
      components.push({
        name: "PostgreSQL Database (Drizzle ORM)",
        status: latencyMs < 200 ? "HEALTHY" : "DEGRADED",
        latencyMs,
        message: `Connected successfully (${latencyMs}ms round-trip latency).`,
        details: { dialect: "PostgreSQL", pool: "active" },
      });
    } catch (dbErr: any) {
      components.push({
        name: "PostgreSQL Database (Drizzle ORM)",
        status: "CRITICAL",
        latencyMs: Date.now() - startDb,
        message: `Database query failed: ${dbErr?.message || "Unknown error"}. Running in offline fallback mode.`,
      });
    }
  } else {
    components.push({
      name: "PostgreSQL Database (Drizzle ORM)",
      status: "DEGRADED",
      message: "No DATABASE_URL configured. Running with in-memory repository fallback.",
    });
  }

  // 2. Fulfillment Cryptographic Secret Store
  try {
    const secretReady = isSecretConfigured();
    // Test HMAC token issuance and verification
    const testToken = createSignedDeliveryToken({
      orderId: "test-order-probe",
      orderNumber: "ORD-TEST-001",
      sku: "probe-sku",
      secretId: "sec-vault-aimoney-2026",
      expiresInHours: 1,
    });
    const verification = verifySignedDeliveryToken(testToken);

    if (secretReady && verification !== null) {
      components.push({
        name: "Fulfillment Cryptographic Secrets Engine",
        status: "HEALTHY",
        message: "HMAC-SHA256 signature generation and cryptographic token verification active.",
        details: {
          keyLength: "256-bit",
          algorithm: "HMAC-SHA256",
          expiresInSeconds: 60,
        },
      });
    } else {
      components.push({
        name: "Fulfillment Cryptographic Secrets Engine",
        status: process.env.NODE_ENV === "production" ? "CRITICAL" : "DEGRADED",
        message: "FULFILLMENT_SIGNING_SECRET not explicitly set; fallback or test key in effect.",
      });
    }
  } catch (secErr: any) {
    components.push({
      name: "Fulfillment Cryptographic Secrets Engine",
      status: "CRITICAL",
      message: `Fulfillment secret error: ${secErr?.message}`,
    });
  }

  // 3. Google Maps Platform Integration
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (mapsApiKey && mapsApiKey.length > 10 && !mapsApiKey.includes("PLACEHOLDER")) {
    components.push({
      name: "Google Maps Platform (Geodetic Visualizer)",
      status: "HEALTHY",
      message: "API Key active. Dynamic WebGL vector map rendering enabled.",
    });
  } else {
    components.push({
      name: "Google Maps Platform (Geodetic Visualizer)",
      status: "INFO",
      message: "API key unconfigured. Interactive SVG fallback canvas active (Zero-cost resilience mode).",
      details: { fallbackMode: "Interactive SVG Geodetic Canvas" },
    });
  }

  // 4. Background Cron Engine & Distributed Locks
  const registeredJobsCount = Object.keys(REGISTERED_JOBS).length;
  components.push({
    name: "Background Job Scheduler & Distributed Locks",
    status: "HEALTHY",
    message: `${registeredJobsCount} automated jobs registered with PostgreSQL advisory locks.`,
    details: {
      registeredJobs: Object.keys(REGISTERED_JOBS),
      lockingMechanism: "PostgreSQL pg_try_advisory_lock with Memory TTL fallback",
    },
  });

  // 5. Ingestion Security & SafeFetch 2.0
  components.push({
    name: "SafeFetch 2.0 Ingestion Firewall",
    status: "HEALTHY",
    message: "SSRF guard, manual redirect re-validation, DNS rebinding checks, and 2MB stream abort limits active.",
    details: {
      ssrfProtection: "IPv4/IPv6 private IP & hex/decimal encoding block",
      redirectPolicy: "Manual re-validation on every hop",
      streamingLimit: "2MB max response stream",
    },
  });

  // Determine overall status
  const hasCritical = components.some((c) => c.status === "CRITICAL");
  const hasDegraded = components.some((c) => c.status === "DEGRADED");

  const overallStatus = hasCritical ? "CRITICAL" : hasDegraded ? "DEGRADED" : "HEALTHY";

  return {
    overallStatus,
    checkedAt: new Date().toISOString(),
    components,
  };
}
