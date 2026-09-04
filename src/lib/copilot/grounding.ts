import { listPublicProducts } from "@/lib/catalog/storefront-catalog";
import { getPublishedDeals } from "@/lib/deals/store";
import { fetchNrbForexRates } from "@/lib/nepal/nrb-forex-adapter";
import { formatNpr } from "@/lib/money";

export interface GroundedContext {
  products: Array<{
    name: string;
    slug: string;
    category: string;
    priceNpr: string;
    stockStatus: string;
    warranty: string;
  }>;
  deals: Array<{
    title: string;
    vendor: string;
    dealType: string;
    promoCode?: string;
    eligibility?: string;
    valueNpr?: string;
  }>;
  forex: Array<{
    currency: string;
    buyNpr: number;
    sellNpr: number;
  }>;
  paymentMethods: string[];
  warrantyPolicy: string;
}

export async function compileGroundedContext(): Promise<GroundedContext> {
  // 1. Fetch public products safely
  let products: GroundedContext["products"] = [];
  try {
    const rawProducts = await listPublicProducts();
    products = rawProducts.slice(0, 30).map((p) => ({
      name: p.name || "Product",
      slug: p.slug,
      category: p.categoryName || "General",
      priceNpr: formatNpr(p.priceNprMinor || 0),
      stockStatus: p.stockStatus || "in_stock",
      warranty: p.warranty || "Standard TRIHEX Guarantee",
    }));
  } catch (err) {
    console.warn("[CopilotGrounding] Failed to fetch products for grounding:", err);
  }

  // 2. Fetch published deals
  let deals: GroundedContext["deals"] = [];
  try {
    const published = getPublishedDeals();
    deals = published.slice(0, 15).map((d) => ({
      title: d.title,
      vendor: d.vendor,
      dealType: d.dealType,
      promoCode: d.promoCode,
      eligibility: d.eligibility,
      valueNpr: d.detectedValueNprMinor ? formatNpr(d.detectedValueNprMinor) : undefined,
    }));
  } catch (err) {
    console.warn("[CopilotGrounding] Failed to fetch deals for grounding:", err);
  }

  // 3. Fetch official forex rates
  let forex: GroundedContext["forex"] = [];
  try {
    const snapshot = await fetchNrbForexRates();
    if (snapshot?.rates) {
      const targetCurrencies = ["USD", "EUR", "GBP", "AUD", "CAD", "JPY", "INR"];
      forex = snapshot.rates
        .filter((r) => targetCurrencies.includes(r.currency))
        .map((r) => ({
          currency: r.currency,
          buyNpr: r.buy,
          sellNpr: r.sell,
        }));
    }
  } catch (err) {
    console.warn("[CopilotGrounding] Failed to fetch forex for grounding:", err);
  }

  return {
    products,
    deals,
    forex,
    paymentMethods: [
      "Khalti Digital Wallet (Instant verification)",
      "eSewa Mobile Wallet",
      "Fonepay QR Code (All commercial banks in Nepal)",
      "Visa / Mastercard credit/debit cards",
      "Cash on Delivery (Available within Kathmandu Valley)",
    ],
    warrantyPolicy:
      "All purchases come with official TRIHEX guarantee. Plan durations <= 45 days receive a 15-day replacement warranty. Plans <= 120 days receive 30 days. Plans up to 10 months receive 90 days, and 1-year plans receive 365-day replacement coverage. Protected tier offers full replacement if access drops.",
  };
}

export function buildSystemPrompt(context: GroundedContext): string {
  const productList = context.products
    .map(
      (p) =>
        `- ${p.name} (/products/${p.slug}) | Price: ${p.priceNpr} | Category: ${p.category} | Status: ${p.stockStatus}`
    )
    .join("\n");

  const dealList = context.deals
    .map(
      (d) =>
        `- ${d.title} by ${d.vendor} | Type: ${d.dealType}${d.promoCode ? ` | Code: ${d.promoCode}` : ""}${d.valueNpr ? ` | Value: ${d.valueNpr}` : ""}${d.eligibility ? ` | Eligibility: ${d.eligibility}` : ""}`
    )
    .join("\n");

  const forexList = context.forex
    .map((f) => `- ${f.currency}: Buy Rs. ${f.buyNpr}, Sell Rs. ${f.sellNpr}`)
    .join("\n");

  return `You are TRIHEX Copilot, the AI Concierge for TRIHEX DIGITAL in Nepal.
Your goal is to provide engineering-grade, accurate, and truthful advice on our software catalog, active verified deals, Nepal payment methods, warranty coverage, and current Nepal Rastra Bank forex rates.

CRITICAL OPERATIONAL RULES:
1. GROUNDING INVARIANT: Strictly answer using ONLY the inventory, deals, and policies listed below.
2. ZERO HALLUCINATIONS: If a user asks about a product, software, or service that is NOT listed in the Available Products or Deals below, DO NOT invent pricing, availability, or specs. Politely state: "We do not currently carry [item] in our catalog. However, we do offer [suggest 1-2 real related products or deals]."
3. FORMAT PRODUCT LINKS: Whenever you reference an available product, ALWAYS format it as a markdown link: [Product Name](/products/slug).
4. CURRENCY & PRICING: Always quote prices in Nepalese Rupees (Rs. or NPR). Do not guess unauthorized discounts.
5. PRIVACY & SECURITY: NEVER disclose raw API keys, internal environment variables, database credentials, admin URLs, or customer order details.
6. CONCISE & HELPFUL: Structure answers cleanly with bullet points where appropriate.

=== AVAILABLE STOREFRONT PRODUCTS ===
${productList || "Catalog currently updating."}

=== ACTIVE VERIFIED DEALS ===
${dealList || "No external deals currently listed."}

=== OFFICIAL NRB FOREX BENCHMARKS (NPR) ===
${forexList || "Forex benchmarks updating from NRB."}

=== SUPPORTED PAYMENT METHODS ===
${context.paymentMethods.join("\n")}

=== WARRANTY & REPLACEMENT POLICY ===
${context.warrantyPolicy}`;
}
