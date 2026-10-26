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
import { CyberAcademySection } from "@/components/storefront/cyber-academy-section";
import { DefensiveSecuritySection } from "@/components/storefront/defensive-security-section";
import { LiveDealRadarSection } from "@/components/storefront/live-deal-radar-section";
import { NepalPulseLiveTicker } from "@/components/storefront/nepal-pulse-live-ticker";
import { DailyDropsSection } from "@/components/storefront/daily-drops-section";
import { MarketplaceCategoriesGrid } from "@/components/storefront/marketplace-categories-grid";
import { MarketplaceTrustSection } from "@/components/storefront/marketplace-trust-section";
import { ServicesAtlas } from "@/components/storefront/services-atlas";
import { PricingTrustSection } from "@/components/storefront/pricing-trust-section";
import { HomeVaultBanner } from "@/components/storefront/home-vault-banner";
import { ReturningUserFeed } from "@/components/personalization/returning-user-feed";
import { UnifiedDiscoveryFeed } from "@/components/storefront/discovery-feed";
import { ExpertRecommendationsSection } from "@/components/storefront/expert-recommendations-section";
import { RecentlyViewed } from "@/components/storefront/recently-viewed";
import { getPublishedDeals } from "@/lib/deals/store";
import { getAllPrompts } from "@/lib/prompts/store";
import { BASELINE_NRB_RATES } from "@/lib/nepal/nrb-forex-adapter";
import { BASELINE_NEPAL_SEISMIC } from "@/lib/nepal/earthquake-adapter";
import { getAllNews } from "@/lib/news/store";
import { getAllVaultEntries } from "@/lib/vault/vault-aggregator";
import { getAllResearchItems } from "@/lib/vault/research-registry";
import {
  compactMerchCardForList,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/live-merchandising";
import { productEnquiryUrl } from "@/lib/whatsapp";
import { COMPLIANCE_FOOTER_DISCLAIMER } from "@/lib/compliance/gate";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "TRIHEX DIGITAL — Premium AI Tools, Secret Deals & Digital Marketplace Nepal",
  description:
    "Nepal's largest verified digital intelligence marketplace. Verified AI subscriptions, lifetime deals, free cloud credits, courses, templates, and digital drops with eSewa/Khalti checkout.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  // Do not hold the storefront response open on third-party live feeds. The
  // ticker hydrates from a verified baseline and refreshes itself client-side.
  const all = await getLiveMerchandisingCatalogue();

  const verifiedDeals = getPublishedDeals();
  const allNews = getAllNews();
  const vaultEntries = getAllVaultEntries();
  const researchItems = getAllResearchItems();
  const usdRate =
    BASELINE_NRB_RATES.find((rate) => rate.currency === "USD") ??
    BASELINE_NRB_RATES[0];

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
  const listProducts = shopProducts.map(compactMerchCardForList);
  const featuredProducts = listProducts.slice(0, 24);

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

      {/* ── 2. ALL VERIFIED PACKAGES (CATALOGUE GRID · 2 PER ROW ON MOBILE LIKE NIMBUSSTORE) ── */}
      <section id="all-products" className="scroll-mt-20 py-6 sm:py-12 border-b border-slate-200/80 bg-white">
        <div className="store-container">
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">
                <Package className="h-3.5 w-3.5 text-blue-600" />
                <span>Verified Nepal Storefront · Live Catalogue</span>
              </div>
              <h2 className="font-[family-name:var(--font-sora)] text-xl font-black tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
                Popular Software Packages
              </h2>
              <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
                Explore 24 popular packages here, or open the full catalogue to search and compare all {shopProducts.length} verified product lines.
              </p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
            >
              Advanced Search →
            </Link>
          </Reveal>
          <ProductGrid products={featuredProducts} />
        </div>
      </section>

      {/* ── 3. TRENDING PREMIUM DEALS CAROUSEL ── */}
      <TrendingDealsCarousel products={listProducts} />

      {/* ── 4. FREE DIGITAL VAULT ECOSYSTEM (COURSES, PROMPTS, CREDITS) ── */}
      <FreeVaultSection />

      {/* ── 5. TRIHEX PREMIUM VIP VAULT (LUXURY DARK ASSETS) ── */}
      <PremiumVaultSection />

      {/* ── 6. TRIHEX CYBERSECURITY ACADEMY & ISOLATED LABS ── */}
      <CyberAcademySection />

      {/* ── 7. DEFENSIVE SECURITY & DISASTER RECOVERY ENGINE ── */}
      <DefensiveSecuritySection />

      {/* ── 8. LIVE DEAL RADAR & CLOUD CREDITS (PUBLIC FEED) ── */}
      <LiveDealRadarSection deals={verifiedDeals} />

      {/* ── 9. TODAY'S DIGITAL DROPS (PRODUCT HUNT STYLE) ── */}
      <DailyDropsSection />

      {/* ── 10. MARKETPLACE CATEGORIES MATRIX ── */}
      <MarketplaceCategoriesGrid />

      {/* ── 11. RETURNING USER PERSONALIZATION & RECENTLY VIEWED ── */}
      <ReturningUserFeed />

      {/* ── 10. UNIFIED DISCOVERY MATRIX (PRODUCTS + VAULT + DEALS + RESEARCH) ── */}
      <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="store-container">
          <UnifiedDiscoveryFeed
            products={listProducts}
            vaultDrops={vaultEntries}
            deals={verifiedDeals}
            news={allNews}
            researchBriefs={researchItems}
          />
        </div>
      </section>

      {/* ── 11. NEPAL PULSE LIVE TICKER & GEODETIC BANNER (24/7 LIVE RADAR) ── */}
      <NepalPulseLiveTicker
        initialUsdBuy={usdRate.buy}
        initialUsdSell={usdRate.sell}
        initialSeismicCount={BASELINE_NEPAL_SEISMIC.length}
      />

      {/* ── 11B. EXPERT RECOMMENDATIONS & VIP DECISION BOARD ── */}
      <ExpertRecommendationsSection />

      {/* ── 11C. RECENTLY VIEWED PRODUCTS ── */}
      <div className="store-container">
        <RecentlyViewed excludeCurrent={false} />
      </div>

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
