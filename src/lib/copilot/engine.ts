import { reason } from "@/lib/providers/router";
import { compileGroundedContext, buildSystemPrompt, GroundedContext } from "./grounding";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CopilotResponse {
  content: string;
  provider: string;
  groundedSources: Array<{
    title: string;
    url: string;
    type: "product" | "deal" | "forex" | "policy";
  }>;
  isFallback: boolean;
}

export async function generateCopilotResponse(
  userQuery: string,
  history: ChatMessage[] = []
): Promise<CopilotResponse> {
  const context = await compileGroundedContext();
  const systemPrompt = buildSystemPrompt(context);

  // Build grounded source links relevant to the user query
  const q = userQuery.toLowerCase();
  const relevantSources: CopilotResponse["groundedSources"] = [];

  for (const p of context.products) {
    if (q.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(q) || q.includes(p.slug)) {
      relevantSources.push({
        title: p.name,
        url: `/products/${p.slug}`,
        type: "product",
      });
    }
  }

  for (const d of context.deals) {
    if (q.includes(d.vendor.toLowerCase()) || q.includes("deal") || q.includes("discount")) {
      relevantSources.push({
        title: d.title,
        url: "/deals",
        type: "deal",
      });
    }
  }

  if (/dollar|usd|forex|exchange|rate|npr|currency/.test(q)) {
    relevantSources.push({
      title: "Nepal Rastra Bank Forex Benchmarks",
      url: "/nepal",
      type: "forex",
    });
  }

  if (/warranty|guarantee|refund|replacement/.test(q)) {
    relevantSources.push({
      title: "TRIHEX Replacement Warranty Policy",
      url: "/policies/warranty",
      type: "policy",
    });
  }

  // Attempt reasoning via Provider Control Plane
  try {
    const promptWithHistory = history.length > 0
      ? `Conversation History:\n${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n")}\n\nUser Query: ${userQuery}`
      : userQuery;

    const llmResponse = await reason({
      prompt: promptWithHistory,
      systemPrompt,
      temperature: 0.2,
      maxTokens: 1000,
    });

    if (llmResponse?.content) {
      return {
        content: llmResponse.content,
        provider: llmResponse.providerId,
        groundedSources: relevantSources.slice(0, 5),
        isFallback: false,
      };
    }
  } catch (err: any) {
    console.warn("[CopilotEngine] Provider reasoning unavailable, activating deterministic grounded fallback:", err?.message);
  }

  // Fallback: Deterministic grounded response
  const fallbackText = generateDeterministicFallback(userQuery, context);
  return {
    content: fallbackText,
    provider: "deterministic_grounded_fallback",
    groundedSources: relevantSources.slice(0, 5),
    isFallback: true,
  };
}

export function generateDeterministicFallback(query: string, context: GroundedContext): string {
  const q = query.toLowerCase().trim();

  // 1. Forex queries
  if (/forex|dollar|usd|exchange rate|npr rate|currency/.test(q)) {
    const usd = context.forex.find((f) => f.currency === "USD");
    const eur = context.forex.find((f) => f.currency === "EUR");
    const gbp = context.forex.find((f) => f.currency === "GBP");

    let text = "Here are the latest official Nepal Rastra Bank (NRB) exchange benchmarks:\n\n";
    if (usd) text += `- **USD (US Dollar)**: Buy Rs. ${usd.buyNpr.toFixed(2)} | Sell Rs. ${usd.sellNpr.toFixed(2)}\n`;
    if (eur) text += `- **EUR (Euro)**: Buy Rs. ${eur.buyNpr.toFixed(2)} | Sell Rs. ${eur.sellNpr.toFixed(2)}\n`;
    if (gbp) text += `- **GBP (British Pound)**: Buy Rs. ${gbp.buyNpr.toFixed(2)} | Sell Rs. ${gbp.sellNpr.toFixed(2)}\n`;
    text += "\nYou can view live trend charts and all foreign currencies at our [/nepal](/nepal) intelligence center.";
    return text;
  }

  // 2. Warranty / Guarantee queries
  if (/warranty|guarantee|replace|refund|broken|duration/.test(q)) {
    return `### TRIHEX Warranty & Replacement Guarantee
${context.warrantyPolicy}

**Key Details:**
- **Tier 1 (≤ 45 days)**: 15-day replacement warranty.
- **Tier 2 (≤ 120 days)**: 30-day replacement warranty.
- **Tier 3 (≤ 330 days)**: 90-day replacement warranty.
- **Tier 4 (1 Year+)**: Full 365-day replacement coverage.
- If any software credential fails or expires prematurely under the Protected tier, our engineering desk issues a verified replacement.`;
  }

  // 3. Payment methods queries
  if (/payment|khalti|esewa|fonepay|qr|card|cash on delivery|cod|how to pay/.test(q)) {
    return `### Accepted Payment Methods in Nepal
We offer 100% verified local payment options with instant activation:
${context.paymentMethods.map((m) => `- ${m}`).join("\n")}

You can select any of these during secure checkout.`;
  }

  // 4. Deals queries
  if (/deal|deals|discount|offer|coupon|free credit|student/.test(q)) {
    if (context.deals.length > 0) {
      const dealItems = context.deals
        .slice(0, 4)
        .map(
          (d) =>
            `- **${d.title}** (${d.vendor}): ${d.dealType}${d.promoCode ? ` — Code: \`${d.promoCode}\`` : ""}${d.valueNpr ? ` (Est. Value: ${d.valueNpr})` : ""}`
        )
        .join("\n");
      return `### Verified Deals on TRIHEX Deal Radar
Here are top verified tech perks currently active:
${dealItems}

Browse all verified offers with audit records on the [Deals Radar](/deals).`;
    }
    return "There are currently no active deal perks listed on our radar. Check back soon or visit our [Storefront Catalog](/products).";
  }

  // 5. Product search queries
  const matchingProducts = context.products.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase());
    const slugMatch = q.includes(p.slug);
    const catMatch = q.includes(p.category.toLowerCase());
    return nameMatch || slugMatch || catMatch;
  });

  if (matchingProducts.length > 0) {
    const list = matchingProducts
      .slice(0, 4)
      .map((p) => `- [${p.name}](/products/${p.slug}) — **${p.priceNpr}** (${p.stockStatus === "in_stock" ? "In Stock" : p.stockStatus})`)
      .join("\n");
    return `### Available Products Matching Your Request
${list}

Click on any item to view tier options, instant delivery details, and add to your cart.`;
  }

  // 6. Unknown / Unstocked product query check
  const commonTechTools = ["netflix", "chatgpt", "midjourney", "grammarly", "adobe", "figma", "notion", "canva", "spotify", "cursor", "jetbrains", "github", "windows", "office"];
  const askedTool = commonTechTools.find((t) => q.includes(t));
  if (askedTool) {
    const featured = context.products.slice(0, 3).map((p) => `- [${p.name}](/products/${p.slug}) (${p.priceNpr})`).join("\n");
    return `TRIHEX DIGITAL does not currently have **${askedTool.toUpperCase()}** in our verified inventory.

Here are some popular developer and productivity tools currently in stock:
${featured}

You can also request special procurement via WhatsApp or check our [Storefront Catalog](/products).`;
  }

  // 7. Generic greeting or unclassified
  const suggestions = context.products.slice(0, 3).map((p) => `- [${p.name}](/products/${p.slug}) (${p.priceNpr})`).join("\n");
  return `Hello! I'm **TRIHEX Copilot**, your digital shopping assistant.

How can I help you today?
- **Products & Tools**: Browse verified developer and productivity subscriptions.
- **Deals & Credits**: Discover verified cloud and student developer perks on [Deal Radar](/deals).
- **Exchange Rates**: Check real-time [Nepal Rastra Bank forex rates](/nepal).
- **Warranty**: Inquire about our tiered replacement guarantees.

Here are a few popular items currently available:
${suggestions}`;
}
