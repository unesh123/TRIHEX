import { ProviderHealthCheckResult, ProviderStatus } from "./types";
import { getProviderSecret, isProviderConfigured } from "@/lib/env/server";
import { updateProviderStatus } from "./registry";

export async function testProviderConnection(providerId: string): Promise<ProviderHealthCheckResult> {
  const normalized = providerId.trim().toLowerCase();
  const testedAt = new Date().toISOString();

  if (!isProviderConfigured(normalized)) {
    const result: ProviderHealthCheckResult = {
      providerId: normalized,
      status: "NOT_CONFIGURED",
      latencyMs: 0,
      message: "Missing required environment configuration.",
      testedAt,
    };
    updateProviderStatus(normalized, {
      healthStatus: "NOT_CONFIGURED",
      lastCheckedAt: testedAt,
      lastLatencyMs: 0,
    });
    return result;
  }

  const secret = getProviderSecret(normalized);
  if (!secret) {
    return {
      providerId: normalized,
      status: "NOT_CONFIGURED",
      latencyMs: 0,
      message: "Secret could not be resolved from server environment.",
      testedAt,
    };
  }

  const start = Date.now();

  try {
    switch (normalized) {
      case "gemini": {
        // Ping Google Generative AI API models endpoint
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(secret)}`,
          { signal: AbortSignal.timeout(6000) }
        );
        const latencyMs = Date.now() - start;
        const status: ProviderStatus = res.ok ? "HEALTHY" : "DEGRADED";
        const message = res.ok
          ? `Gemini API connection healthy (${latencyMs}ms)`
          : `Gemini returned HTTP ${res.status}`;

        updateProviderStatus(normalized, {
          healthStatus: status,
          lastCheckedAt: testedAt,
          lastLatencyMs: latencyMs,
          lastError: res.ok ? undefined : `HTTP ${res.status}`,
        });

        return {
          providerId: normalized,
          status,
          latencyMs,
          statusCode: res.status,
          message,
          testedAt,
        };
      }

      case "openai": {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${secret}` },
          signal: AbortSignal.timeout(6000),
        });
        const latencyMs = Date.now() - start;
        const status: ProviderStatus = res.ok ? "HEALTHY" : "DEGRADED";
        const message = res.ok
          ? `OpenAI connection healthy (${latencyMs}ms)`
          : `OpenAI returned HTTP ${res.status} (key verification or rotation recommended)`;

        updateProviderStatus(normalized, {
          healthStatus: status,
          lastCheckedAt: testedAt,
          lastLatencyMs: latencyMs,
          lastError: res.ok ? undefined : `HTTP ${res.status}`,
        });

        return {
          providerId: normalized,
          status,
          latencyMs,
          statusCode: res.status,
          message,
          testedAt,
        };
      }

      case "youcom": {
        const res = await fetch("https://api.ydc-index.io/search?query=Nepal+news&count=1", {
          headers: { "X-API-Key": secret },
          signal: AbortSignal.timeout(6000),
        });
        const latencyMs = Date.now() - start;
        const status: ProviderStatus = res.ok ? "HEALTHY" : "DEGRADED";
        const message = res.ok
          ? `You.com search index connection healthy (${latencyMs}ms)`
          : `You.com returned HTTP ${res.status}`;

        updateProviderStatus(normalized, {
          healthStatus: status,
          lastCheckedAt: testedAt,
          lastLatencyMs: latencyMs,
          lastError: res.ok ? undefined : `HTTP ${res.status}`,
        });

        return {
          providerId: normalized,
          status,
          latencyMs,
          statusCode: res.status,
          message,
          testedAt,
        };
      }

      case "azure_speech": {
        const region = process.env.AZURE_SPEECH_REGION || "eastus";
        const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, {
          method: "POST",
          headers: { "Ocp-Apim-Subscription-Key": secret },
          signal: AbortSignal.timeout(6000),
        });
        const latencyMs = Date.now() - start;
        const status: ProviderStatus = res.ok ? "HEALTHY" : "DEGRADED";
        const message = res.ok
          ? `Azure Speech STS connection healthy (${latencyMs}ms)`
          : `Azure Speech returned HTTP ${res.status}`;

        updateProviderStatus(normalized, {
          healthStatus: status,
          lastCheckedAt: testedAt,
          lastLatencyMs: latencyMs,
          lastError: res.ok ? undefined : `HTTP ${res.status}`,
        });

        return {
          providerId: normalized,
          status,
          latencyMs,
          statusCode: res.status,
          message,
          testedAt,
        };
      }

      default: {
        return {
          providerId: normalized,
          status: "NOT_CONFIGURED",
          latencyMs: 0,
          message: `Health probe not configured for provider ${normalized}`,
          testedAt,
        };
      }
    }
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    const message = error?.message || "Connection failed";

    updateProviderStatus(normalized, {
      healthStatus: "ERROR",
      lastCheckedAt: testedAt,
      lastLatencyMs: latencyMs,
      lastError: message,
    });

    return {
      providerId: normalized,
      status: "ERROR",
      latencyMs,
      message,
      testedAt,
    };
  }
}
