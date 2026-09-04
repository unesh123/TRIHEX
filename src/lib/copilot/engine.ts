import { reason } from "@/lib/providers/router";
import { compileGroundedContext, buildSystemPrompt, GroundedContext } from "./grounding";
import { getAllPrompts } from "@/lib/prompts/store";
import { getAllNews } from "@/lib/news/store";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type CopilotIntent =
  | "product_inquiry"
  | "deal_radar"
  | "prompt_discovery"
  | "around_me"
  | "news_brief"
  | "research_deep_dive"
  | "general_help";

export interface SuggestedAction {
  label: string;
  href: string;
}

export interface CopilotResponse {
  content: string;
  provider: string;
  intent: CopilotIntent;
  intentConfidence: number;
  suggestedActions: SuggestedAction[];
  groundedSources: Array<{
    title: string;
    url: string;
    type: "product" | "deal" | "forex" | "policy" | "prompt" | "news" | "map";
  }>;
  isFallback: boolean;
}

export function classifyUserIntent(query: string): {
  intent: CopilotIntent;
  confidence: number;
  suggestedActions: SuggestedAction[];
} {
  const q = query.toLowerCase().trim();

  // 1. Around Me / Civic Geolocation
  if (/around me|near me|location|kathmandu|pokhara|lalitpur|bhaktapur|map|pickup|delivery area|distance|km\b|radius/.test(q)) {
    return {
      intent: "around_me",
      confidence: 0.92,
      suggestedActions: [
        { label: "Explore Interactive Map", href: "/map" },
        { label: "Find Civic Hubs Near Me", href: "/map?around=true" },
      ],
    };
  }

  // 2. Prompt Engineering / Templates
  if (/prompt|template|chatgpt prompt|midjourney prompt|flux|sora|c# prompt|next\.js prompt|laravel prompt|system prompt/.test(q)) {
    return {
      intent: "prompt_discovery",
      confidence: 0.95,
      suggestedActions: [
        { label: "Browse 100+ Prompt Templates", href: "/prompts" },
        { label: "Explore Coding Prompts", href: "/prompts?category=CODING" },
      ],
    };
  }

  // 3. Deals / Vouchers / Credits
  if (/deal|discount|student pack|free credit|digitalocean credit|aws credit|promo|voucher|coupon|offer/.test(q)) {
    return {
      intent: "deal_radar",
      confidence: 0.94,
      suggestedActions: [
        { label: "Open Deal Radar", href: "/deals" },
        { label: "Explore Unified Vault", href: "/vault?tab=deals" },
      ],
    };
  }

  // 4. Live News & Headlines
  if (/news|headline|circular|nrb directive|breaking|update|latest happening|ai release/.test(q)) {
    return {
      intent: "news_brief",
      confidence: 0.90,
      suggestedActions: [
        { label: "Live News Intelligence", href: "/news" },
        { label: "Nepal Tech News", href: "/news/nepal" },
        { label: "Global AI News", href: "/news/ai" },
      ],
    };
  }

  // 5. Research / Deep Dive / Macro / Seismic
  if (/research|earthquake|seismic|macro|remittance|trade deficit|inflation|nso|population|forex analysis/.test(q)) {
    return {
      intent: "research_deep_dive",
      confidence: 0.91,
      suggestedActions: [
        { label: "Nepal Research Hub", href: "/nepal/research" },
        { label: "Civic Data Benchmarks", href: "/nepal" },
      ],
    };
  }

  // 6. Product Inquiry / Pricing / Stock / Payment / Warranty
  if (/product|buy|price|cost|stock|available|license|sub|subscription|cursor|jetbrains|chatgpt|payment|khalti|esewa|warranty|replace/.test(q)) {
    return {
      intent: "product_inquiry",
      confidence: 0.88,
      suggestedActions: [
        { label: "Browse Product Catalogue", href: "/products" },
        { label: "View Warranty Policy", href: "/policies/warranty" },
      ],
    };
  }

  return {
    intent: "general_help",
    confidence: 0.75,
    suggestedActions: [
      { label: "Explore Products", href: "/products" },
      { label: "Deal Radar", href: "/deals" },
      { label: "Interactive Map", href: "/map" },
    ],
  };
}

export async function generateCopilotResponse(
  userQuery: string,
  history: ChatMessage[] = []
): Promise<CopilotResponse> {
  const context = await compileGroundedContext();
  const systemPrompt = buildSystemPrompt(context);
  const classification = classifyUserIntent(userQuery);

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

  if (/prompt|template/.test(q)) {
    relevantSources.push({
      title: "TRIHEX 100+ Prompt Library",
      url: "/prompts",
      type: "prompt",
    });
  }

  if (/news|headline/.test(q)) {
    relevantSources.push({
      title: "Live News Intelligence Hub",
      url: "/news",
      type: "news",
    });
  }

  if (/around me|map|location/.test(q)) {
    relevantSources.push({
      title: "Interactive Civic Map & Around Me",
      url: "/map",
      type: "map",
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
        intent: classification.intent,
        intentConfidence: classification.confidence,
        suggestedActions: classification.suggestedActions,
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
    intent: classification.intent,
    intentConfidence: classification.confidence,
    suggestedActions: classification.suggestedActions,
    groundedSources: relevantSources.slice(0, 5),
    isFallback: true,
  };
}

export function generateDeterministicFallback(query: string, context: GroundedContext): string {
  const q = query.toLowerCase().trim();
  const classification = classifyUserIntent(query);

  // 1. Around Me / Geographic queries
  if (classification.intent === "around_me") {
    return `### Physical Locations & Digital Fulfillment in Nepal
All TRIHEX DIGITAL software licenses and subscriptions are delivered **100% digitally across all 77 districts of Nepal** with verified credentials and official VAT/PAN tax documentation.

If you are looking for physical support hubs, tech partner locations, or civic data centers:
- You can explore our [Interactive Civic Map](/map).
- Use the **"Around Me"** ephemeral geolocation tool to filter verified points of interest within 5, 10, 25, 50, or 100 km of your current position.
- Official operations and executive licensing desk is headquartered in the Kathmandu metropolitan valley.`;
  }

  // 2. Prompt Library queries
  if (classification.intent === "prompt_discovery") {
    const prompts = getAllPrompts().slice(0, 3);
    const promptList = prompts
      .map((p) => `- **[${p.title}](/prompts/${p.slug})** (${p.category}): ${p.description}`)
      .join("\n");

    return `### TRIHEX 100+ Production Prompt Vault
We maintain an authoritative repository of 100+ original, typed prompt templates engineered for modern tech stacks:

${promptList}

Explore all 100+ templates with 1-click copy and variable configuration on the [Prompt Vault](/prompts).`;
  }

  // 3. News & Headlines queries
  if (classification.intent === "news_brief") {
    const newsItems = getAllNews().slice(0, 3);
    const newsList = newsItems
      .map((n) => `- **[${n.title}](/news/${n.slug})** (${n.source}): ${n.excerpt}`)
      .join("\n");

    return `### Live Tech & Policy Headlines
Here are the latest corroborated headlines from our intelligence feeds:

${newsList}

Visit the [Live News Portal](/news) for real-time updates across Nepal tech, monetary circulars, and global AI breakthroughs.`;
  }

  // 4. Deep Research queries
  if (classification.intent === "research_deep_dive") {
    return `### Nepal Ground Truth Research Engine
TRIHEX Deep Research synthesizes evidence-backed intelligence across official institutional feeds:
- **Nepal Rastra Bank (NRB)**: Official daily exchange rates and foreign reserve liquidity metrics.
- **USGS FDSN Feed**: Real-time tectonic and seismic event monitoring along the Himalayan Arc.
- **National Statistics Office (NSO)**: Demographics, energy capacity, and census datasets.

Explore comprehensive research briefings and cite verified primary data at the [Nepal Research Hub](/nepal/research).`;
  }

  // 5. Forex queries
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

  // 6. Warranty / Guarantee queries
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

  // 7. Payment methods queries
  if (/payment|khalti|esewa|fonepay|qr|card|cash on delivery|cod|how to pay/.test(q)) {
    return `### Accepted Payment Methods in Nepal
We offer 100% verified local payment options with instant activation:
${context.paymentMethods.map((m) => `- ${m}`).join("\n")}

You can select any of these during secure checkout.`;
  }

  // 8. Deals queries
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

  // 9. Product search queries
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

  // 10. Unknown / Unstocked product query check
  const commonTechTools = ["netflix", "chatgpt", "midjourney", "grammarly", "adobe", "figma", "notion", "canva", "spotify", "cursor", "jetbrains", "github", "windows", "office"];
  const askedTool = commonTechTools.find((t) => q.includes(t));
  if (askedTool) {
    const featured = context.products.slice(0, 3).map((p) => `- [${p.name}](/products/${p.slug}) (${p.priceNpr})`).join("\n");
    return `TRIHEX DIGITAL does not currently have **${askedTool.toUpperCase()}** in our verified inventory.

Here are some popular developer and productivity tools currently in stock:
${featured}

You can also request special procurement via WhatsApp or check our [Storefront Catalog](/products).`;
  }

  // 11. Generic greeting or unclassified
  const suggestions = context.products.slice(0, 3).map((p) => `- [${p.name}](/products/${p.slug}) (${p.priceNpr})`).join("\n");
  return `Hello! I'm **TRIHEX Copilot**, your digital shopping assistant.

How can I help you today?
- **Products & Tools**: Browse verified developer and productivity subscriptions.
- **Deals & Credits**: Discover verified cloud and student developer perks on [Deal Radar](/deals).
- **Prompt Vault**: Explore 100+ original [Engineering Prompts](/prompts).
- **Exchange Rates**: Check real-time [Nepal Rastra Bank forex rates](/nepal).
- **Civic Map**: Find tech hubs and services on our [Interactive Map](/map).

Here are a few popular items currently available:
${suggestions}`;
}
