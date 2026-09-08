import { JsonLd, faqJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  Package,
  ShieldCheck,
  Sparkles,
  Flame,
  Cpu,
  MapPin,
  Activity,
  ArrowRight,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/storefront/product-grid";
import { MarketplaceHero } from "@/components/storefront/marketplace-hero";
import { TrendingDealsCarousel } from "@/components/storefront/trending-deals-carousel";
import { FreeVaultSection } from "@/components/storefront/free-vault-section";
import { PremiumVaultSection } from "@/components/storefront/premium-vault-section";
import { LiveDealRadarSection } from "@/components/storefront/live-deal-radar-section";
import { DailyDropsSection } from "@/components/storefront/daily-drops-section";
import { MarketplaceCategoriesGrid } from "@/components/storefront/marketplace-categories-grid";
import { MarketplaceTrustSection } from "@/components/storefront/marketplace-trust-section";
import { ServicesAtlas } from "@/components/storefront/services-atlas";
import { PricingTrustSection } from "@/components/storefront/pricing-trust-section";
import { HomeVaultBanner } from "@/components/storefront/home-vault-banner";
import { ReturningUserFeed } from "@/components/personalization/returning-user-feed";
import { UnifiedDiscoveryFeed } from "@/components/storefront/discovery-feed";
import { getPublishedDeals } from "@/lib/deals/store";
import { getAllPrompts } from "@/lib/prompts/store";
import { fetchNrbForexRates } from "@/lib/nepal/nrb-forex-adapter";
import { fetchNepalSeismicEvents } from "@/lib/nepal/earthquake-adapter";
import { getAllNews } from "@/lib/news/store";
import { getAllVaultEntries } from "@/lib/vault/vault-aggregator";
import { getAllResearchItems } from "@/lib/vault/research-registry";
import {
  getLiveMerchandisingCatalogue,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { getCatalogueStats } from "@/lib/catalog/catalogue-stats";
import { productEnquiryUrl } from "@/lib/whatsapp";
import { COMPLIANCE_FOOTER_DISCLAIMER } from "@/lib/compliance/gate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX DIGITAL — Premium AI Tools, Secret Deals & Digital Marketplace Nepal",
  description:
    "Nepal's largest verified digital intelligence marketplace. Verified AI subscriptions, lifetime deals, free cloud credits, courses, templates, and digital drops with eSewa/Khalti checkout.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [all, liveForex, liveSeismic, stats] = await Promise.all([
    getLiveMerchandisingCatalogue(),
    fetchNrbForexRates(),
    fetchNepalSeismicEvents(),
    getCatalogueStats(),
  ]);

  const verifiedDeals = getPublishedDeals();
  const allNews = getAllNews();
  const vaultEntries = getAllVaultEntries();
  const researchItems = getAllResearchItems();
  const usdRate = liveForex.rates.find((r) => r.currency === "USD") || liveForex.rates[0];

  const clean = all.filter((product) => {
    const title = (product.title ?? "").toLowerCase();
    const slug = (product.slug ?? "").toLowerCase();
    if (title.includes("moths")) return false;
    if (title.includes("(plan)") && title.includes("super grok 6")) return false;
    if (slug.includes("trihex-test-sku") || title.includes("test sku")) return false;
    return product.visibility !== "BLOCKED";
  });

  const catalogue = withFamilyGrouping(clean).sort((a, b) => {
    const buyRank = (product: (typeof clean)[number]) => {
      if (product.purchasable && product.visibility === "AVAILABLE") return 0;
      if (product.visibility === "AVAILABLE") return 1;
      if (product.visibility === "AVAILABILITY_UNDER_REVIEW") return 2;
      if (product.visibility === "OUT_OF_STOCK") return 3;
      return 4;
    };
    const rankDifference = buyRank(a) - buyRank(b);
    if (rankDifference !== 0) return rankDifference;
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return (a.priceNprMinor ?? Number.MAX_SAFE_INTEGER) - (b.priceNprMinor ?? Number.MAX_SAFE_INTEGER);
  });

  const services = catalogue.filter(
    (product) =>
      product.brandSlug === "trihex" &&
      (product.categorySlug === "services" || product.categorySlug === "digital-assets"),
  );
  const shopProducts = catalogue.filter(
    (product) =>
      !(
        product.brandSlug === "trihex" &&
        (product.categorySlug === "services" || product.categorySlug === "digital-assets")
      ),
  );

  return (
    <div className="overflow-x-clip bg-white">
      <JsonLd
        data={faqJsonLd([
          {
            question: "Is every product available for checkout?",
            answer:
              "Yes, packages marked Available can be ordered online immediately via eSewa, Khalti, or Bank QR.",
          },
          {
            question: "Does WhatsApp create my order?",
            answer:
              "No. The TRIHEX website is the order record. WhatsApp is used for human support, payment slip confirmation, and instant credential delivery.",
          },
          {
            question: "How can I access the Free Vault drops?",
            answer:
              "Every free vault drop (including courses, cloud credits, and prompt packs) is verified. Click Unlock Free Access to receive the unmasked link immediately.",
          },
        ])}
      />

      {/* ── 1. SAAS MARKETPLACE HERO ── */}
      <MarketplaceHero
        stats={{
          productCount: shopProducts.length,
          vaultCount: vaultEntries.length,
          dealsCount: verifiedDeals.length,
        }}
      />

      {/* ── 2. TRENDING PREMIUM DEALS CAROUSEL ── */}
      <TrendingDealsCarousel products={shopProducts} />

      {/* ── 3. FREE DIGITAL VAULT ECOSYSTEM (COURSES, PROMPTS, CREDITS) ── */}
      <FreeVaultSection />

      {/* ── 4. TRIHEX PREMIUM VIP VAULT (LUXURY DARK ASSETS) ── */}
      <PremiumVaultSection />

      {/* ── 5. LIVE DEAL RADAR & CLOUD CREDITS (PUBLIC FEED) ── */}
      <LiveDealRadarSection deals={verifiedDeals} />

      {/* ── 6. TODAY'S DIGITAL DROPS (PRODUCT HUNT STYLE) ── */}
      <DailyDropsSection />

      {/* ── 7. MARKETPLACE CATEGORIES MATRIX ── */}
      <MarketplaceCategoriesGrid />

      {/* ── 8. RETURNING USER PERSONALIZATION & RECENTLY VIEWED ── */}
      <ReturningUserFeed />

      {/* ── 9. ALL VERIFIED PACKAGES (CATALOGUE GRID) ── */}
      <section id="all-products" className="scroll-mt-24 py-14 sm:py-20 border-b border-border">
        <div className="store-container">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                <Package className="h-3.5 w-3.5 text-blue-600" />
                <span>Complete Storefront Catalogue</span>
              </div>
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                All Available Software Packages
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {shopProducts.length} verified packages ready for instant checkout with live NPR prices. CapCut Pro 1-Month at Rs. 399, Gemini Pro 18-Months at Rs. 399, ChatGPT Plus, Claude Pro, and more.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Filter &amp; Search All →
            </Link>
          </Reveal>
          <ProductGrid products={shopProducts} />
        </div>
      </section>

      {/* ── 10. UNIFIED DISCOVERY MATRIX (PRODUCTS + VAULT + DEALS + RESEARCH) ── */}
      <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="store-container">
          <UnifiedDiscoveryFeed
            products={shopProducts}
            vaultDrops={vaultEntries}
            deals={verifiedDeals}
            news={allNews}
            researchBriefs={researchItems}
          />
        </div>
      </section>

      {/* ── 11. NEPAL PULSE LIVE TICKER & GEODETIC BANNER ── */}
      <section className="border-b border-slate-200/80 bg-gradient-to-r from-red-950/30 via-slate-900 to-blue-950/30 py-7 text-white">
        <div className="store-container flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" /> Live Nepal Macro Feeds
            </div>
            <div className="text-sm font-bold text-white">
              Official NRB Forex: 1 USD = NPR {usdRate.buy.toFixed(2)} (Buy) · USGS Seismic: {liveSeismic.events.length} monitored events
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/nepal"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              Forex &amp; Data Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <MapPin className="w-3.5 h-3.5" /> Interactive Map
            </Link>
          </div>
        </div>
      </section>

      {/* ── 12. TRUST SYSTEM & PROOF MATRIX ── */}
      <MarketplaceTrustSection />

      {/* ── 13. FREQUENTLY ASKED QUESTIONS & COMPLIANCE ── */}
      <section className="border-t border-[var(--border)] bg-slate-50 py-14 sm:py-18">
        <div className="store-container">
          <Reveal>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Answers Before You Order</span>
            </div>
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Straightforward Answers, Transparent Flow
            </h2>
          </Reveal>
          <div className="mt-7 grid gap-3.5 md:grid-cols-2">
            {[
              ["Is every package available for checkout?", "Yes. Packages marked Available can be ordered online with instant Nepal payment QR (eSewa, Khalti, Bank Transfer)."],
              ["Does WhatsApp create my order?", "No. Your website order creates the official record. WhatsApp is used for delivery questions, credentials dispatch, and live human support."],
              ["How do I know where my order is?", "Use Track Order with your order reference and the email or Nepali mobile number used at checkout."],
              ["How does the Free Vault work?", "Free Vault resources are 100% verified drops. You can unlock the direct cloud links (e.g. Mega folder, prompt library) instantly."],
            ].map(([question, answer], index) => (
              <Reveal key={question} delay={index * 0.035}>
                <div className="h-full rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900">{question}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500">
              <p className="max-w-3xl">{COMPLIANCE_FOOTER_DISCLAIMER}</p>
              <a href={productEnquiryUrl("TRIHEX DIGITAL marketplace", "general enquiry")} className="shrink-0 font-bold text-blue-600 hover:underline">Need help choosing? Ask on WhatsApp →</a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
