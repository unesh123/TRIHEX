import { describe, it, expect } from "vitest";
import {
  getRegisteredProviders,
  getProviderById,
  getProvidersByCategory,
  getProvidersByCapability,
} from "@/lib/providers/registry";
import { checkBudgetGuard, recordUsageCost, getDailyUsageStats } from "@/lib/providers/budget";
import { testProviderConnection } from "@/lib/providers/health";

describe("Provider Control Plane & Routing Engine", () => {
  it("registers all supported providers with verified capabilities", () => {
    const providers = getRegisteredProviders();
    expect(providers.length).toBeGreaterThanOrEqual(7);

    const gemini = getProviderById("gemini");
    expect(gemini).toBeDefined();
    expect(gemini?.capabilities).toContain("LLM_REASONING");
    expect(gemini?.priority).toBe(1);

    const youcom = getProviderById("youcom");
    expect(youcom).toBeDefined();
    expect(youcom?.capabilities).toContain("WEB_SEARCH");
  });

  it("filters providers by category and capability", () => {
    const aiProviders = getProvidersByCategory("AI_REASONING");
    expect(aiProviders.some((p) => p.id === "gemini")).toBe(true);

    const reasoningProviders = getProvidersByCapability("LLM_REASONING");
    expect(reasoningProviders.length).toBeGreaterThanOrEqual(1);
    expect(reasoningProviders[0].id).toBe("gemini"); // Highest priority first
  });

  it("testProviderConnection returns sanitized status without credentials", async () => {
    // Testing unconfigured provider
    const unconfigured = await testProviderConnection("zyte");
    expect(unconfigured.status).toBe("NOT_CONFIGURED");
    expect(unconfigured.latencyMs).toBe(0);
    expect(JSON.stringify(unconfigured)).not.toContain("key");
    expect(JSON.stringify(unconfigured)).not.toContain("secret");
  });

  it("enforces external API budget caps and tracks usage", () => {
    const statsBefore = getDailyUsageStats();
    expect(statsBefore.dailyBudgetCents).toBe(500);

    // Recording usage
    recordUsageCost(25);
    const statsAfter = getDailyUsageStats();
    expect(statsAfter.dailyCostCents).toBeGreaterThanOrEqual(25);

    // Check normal budget allows request
    const allowedCheck = checkBudgetGuard(10);
    expect(allowedCheck.allowed).toBe(true);

    // Excessive cost beyond ceiling is blocked
    const blockedCheck = checkBudgetGuard(1000);
    expect(blockedCheck.allowed).toBe(false);
    expect(blockedCheck.reason).toContain("budget limit reached");
  });
});
