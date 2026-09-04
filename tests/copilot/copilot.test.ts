import { describe, it, expect } from "vitest";
import { compileGroundedContext, buildSystemPrompt } from "@/lib/copilot/grounding";
import { generateDeterministicFallback, generateCopilotResponse } from "@/lib/copilot/engine";

describe("TRIHEX AI Copilot Grounding & Reasoning Engine", () => {
  it("compiles structured storefront context with products, deals, forex, and policies", async () => {
    const context = await compileGroundedContext();

    expect(context.products.length).toBeGreaterThan(0);
    expect(context.deals.length).toBeGreaterThan(0);
    expect(context.paymentMethods).toContain("Khalti Digital Wallet (Instant verification)");
    expect(context.warrantyPolicy).toContain("replacement");
  });

  it("builds a system prompt with strict grounding rules and anti-hallucination invariants", async () => {
    const context = await compileGroundedContext();
    const prompt = buildSystemPrompt(context);

    expect(prompt).toContain("GROUNDING INVARIANT");
    expect(prompt).toContain("ZERO HALLUCINATIONS");
    expect(prompt).toContain("Nepalese Rupees");
    expect(prompt).toContain("AVAILABLE STOREFRONT PRODUCTS");
  });

  it("handles forex queries deterministically with official NRB benchmarks", async () => {
    const context = await compileGroundedContext();
    const reply = generateDeterministicFallback("What is the current USD dollar exchange rate?", context);

    expect(reply).toContain("Nepal Rastra Bank");
    expect(reply).toContain("USD");
    expect(reply).toContain("/nepal");
  });

  it("handles warranty questions with tiered duration guarantees", async () => {
    const context = await compileGroundedContext();
    const reply = generateDeterministicFallback("How does the replacement warranty work?", context);

    expect(reply).toContain("TRIHEX Warranty & Replacement Guarantee");
    expect(reply).toContain("15-day replacement warranty");
    expect(reply).toContain("365-day replacement coverage");
  });

  it("handles payment queries with local Nepal gateways", async () => {
    const context = await compileGroundedContext();
    const reply = generateDeterministicFallback("Can I pay with Khalti or eSewa?", context);

    expect(reply).toContain("Khalti");
    expect(reply).toContain("eSewa");
    expect(reply).toContain("Fonepay");
  });

  it("truthfully states unstocked items instead of hallucinating fake prices or stock", async () => {
    const context = await compileGroundedContext();
    const reply = generateDeterministicFallback("Do you sell netflix subscriptions?", context);

    expect(reply.toLowerCase()).toContain("does not currently have");
    expect(reply.toLowerCase()).toContain("netflix");
  });

  it("executes generateCopilotResponse with deterministic fallback when providers are offline", async () => {
    const res = await generateCopilotResponse("What developer subscriptions are available?");

    expect(res.content.length).toBeGreaterThan(0);
    expect(res.provider).toBeDefined();
    expect(res.isFallback).toBe(true);
  });
});
