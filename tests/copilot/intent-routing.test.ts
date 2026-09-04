import { describe, it, expect } from "vitest";
import { classifyUserIntent } from "@/lib/copilot/engine";

describe("Copilot 2.0 Multi-Task Intent Classification", () => {
  it("classifies location and map queries as around_me", () => {
    const r1 = classifyUserIntent("Are there any pickup hubs around me in Kathmandu?");
    expect(r1.intent).toBe("around_me");
    expect(r1.confidence).toBeGreaterThanOrEqual(0.9);
    expect(r1.suggestedActions.some((a) => a.href === "/map")).toBe(true);

    const r2 = classifyUserIntent("How many km is your nearest service center in Pokhara?");
    expect(r2.intent).toBe("around_me");
  });

  it("classifies prompt templates queries as prompt_discovery", () => {
    const r1 = classifyUserIntent("Do you have any C# prompt templates or Next.js prompts?");
    expect(r1.intent).toBe("prompt_discovery");
    expect(r1.confidence).toBeGreaterThanOrEqual(0.9);
    expect(r1.suggestedActions.some((a) => a.href === "/prompts")).toBe(true);

    const r2 = classifyUserIntent("Show me photorealistic Midjourney prompt formulas");
    expect(r2.intent).toBe("prompt_discovery");
  });

  it("classifies deals, credits, and student pack queries as deal_radar", () => {
    const r1 = classifyUserIntent("How do I claim GitHub student pack or DigitalOcean credit?");
    expect(r1.intent).toBe("deal_radar");
    expect(r1.suggestedActions.some((a) => a.href === "/deals")).toBe(true);

    const r2 = classifyUserIntent("Are there any active discount vouchers or promo codes?");
    expect(r2.intent).toBe("deal_radar");
  });

  it("classifies news and circular queries as news_brief", () => {
    const r1 = classifyUserIntent("What are the latest news updates on NRB directives and AI releases?");
    expect(r1.intent).toBe("news_brief");
    expect(r1.suggestedActions.some((a) => a.href === "/news")).toBe(true);
  });

  it("classifies deep research queries as research_deep_dive", () => {
    const r1 = classifyUserIntent("Give me a deep research breakdown of recent earthquake events and forex remittance");
    expect(r1.intent).toBe("research_deep_dive");
    expect(r1.suggestedActions.some((a) => a.href === "/nepal/research")).toBe(true);
  });

  it("classifies commerce software queries as product_inquiry", () => {
    const r1 = classifyUserIntent("How much is Cursor Pro subscription in NPR?");
    expect(r1.intent).toBe("product_inquiry");
    expect(r1.suggestedActions.some((a) => a.href === "/products")).toBe(true);
  });
});
