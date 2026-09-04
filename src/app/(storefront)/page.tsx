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
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ServicesAtlas } from "@/components/storefront/services-atlas";
import { PricingTrustSection } from "@/components/storefront/pricing-trust-section";
import { HomeVaultBanner } from "@/components/storefront/home-vault-banner";
import {
  getLiveMerchandisingCatalogue,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import {
  getWhatsAppDisplay,
  productEnquiryUrl,
} from "@/lib/whatsapp";
import { COMPLIANCE_FOOTER_DISCLAIMER } from "@/lib/compliance/gate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium AI & Digital Tools for Nepal",
  description:
    "Buy AI and digital tools in Nepal with transparent NPR prices, website checkout, payment-proof review, and local support from TRIHEX DIGITAL.",
  alternates: { canonical: "/" },
};

const CATEGORIES = [
  { href: "/ai-tools-nepal", label: "AI assistants", copy: "Research, writing, intelligence" },
  { href: "/categories/design", label: "Design & creative", copy: "Create stronger visuals" },
  { href: "/categories/video-editing", label: "Video & editing", copy: "Edit, produce, publish" },
  { href: "/categories/developer-tools", label: "Developer tools", copy: "Build and ship faster" },
  { href: "/categories/learning", label: "Learning", copy: "Skills and certifications" },
  { href: "/categories/productivity", label: "Productivity", copy: "Focus, organize, deliver" },
] as const;

const HOW_IT_WORKS = [
  ["01", "Choose a plan", "Compare live prices, eligibility, delivery method, and package terms."],
  ["02", "Order on TRIHEX", "Your website order creates the reference we use for payment and fulfillment."],
  ["03", "Pay and upload proof", "Use the available local payment method, then upload your payment proof securely."],
  ["04", "Track delivery", "Follow payment review and fulfillment in one secure order timeline."],
] as const;

function formatNpr(value: number | null | undefined) {
  if (value == null) return "Price on request";
  return `Rs. ${Math.round(value / 100).toLocaleString("en-NP")}`;
}

export default async function HomePage() {
  const all = await getLiveMerchandisingCatalogue();
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
  const heroProduct =
    shopProducts.find((product) => product.slug.includes("gemini-pro-18")) ??
    shopProducts.find((product) => product.purchasable) ??
    shopProducts[0];
  const trendingProducts = shopProducts
    .filter((product) => {
      const slug = product.slug.toLowerCase();
      return (
        product.featured ||
        slug.includes("chatgpt") ||
        slug.includes("claude-pro") ||
        slug.includes("gemini-pro") ||
        slug.includes("cursor-pro") ||
        slug.includes("capcut") ||
        slug.includes("elevenlabs")
      );
    })
    .slice(0, 5);

  return (
    <div className="overflow-x-clip">
      <JsonLd
        data={faqJsonLd([
          {
            question: "Is every product available for checkout?",
            answer:
              "No. Only packages marked Available can be ordered online. Under Review packages need a quick availability check first.",
          },
          {
            question: "Does WhatsApp create my order?",
            answer:
              "No. The TRIHEX website is the order record. WhatsApp is used for human support and delivery questions.",
          },
          {
            question: "How can I track my order?",
            answer:
              "Use your order number and the email or Nepali mobile number used at checkout on the Track order page.",
          },
        ])}
      />

      {/* ── HERO SECTION (MATCHING NIMBUSSTORE REFERENCE) ── */}
      <section className="relative isolate border-b border-slate-200/80 bg-[linear-gradient(180deg,#fafcff_0%,#f8fafc_100%)] py-14 sm:py-20 lg:py-24">
        <div className="store-container grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left Column: Heading, Copy, Buttons, Trust Indicators */}
          <Reveal className="max-w-2xl">
            {/* Pill Kicker */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-3.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Digital tools with human support</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-6 font-[family-name:var(--font-sora)] text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.6rem] lg:leading-[1.08]">
              Clear products, local payment options, and help when you need it.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Choose a product, submit your payment details securely, and track your order through delivery.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                href="#all-products"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                Browse products
              </Link>
              <Link
                href="/track-order"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Track an order
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Clear pricing before checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-slate-500" />
                Manual payment verification
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-4 w-4 text-teal-600" />
                Track every order
              </span>
            </div>
          </Reveal>

          {/* Right Column: "WHAT TO EXPECT" Process Card */}
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    WHAT TO EXPECT
                  </span>
                  <h2 className="mt-1 font-[family-name:var(--font-sora)] text-xl font-bold text-slate-900 sm:text-2xl">
                    A transparent order process
                  </h2>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-7 space-y-6">
                {/* Step 1 */}
                <div className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                    1
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Choose the right plan
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Review the product, duration, delivery time, and terms.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                    2
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Submit payment details
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Use QR Payment, Manual confirmation; our team verifies the transfer manually.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
                    3
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Track delivery
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Use your order ID to follow payment verification and fulfilment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3-CARD TRUST STRIP (MATCHING NIMBUSSTORE REFERENCE) ── */}
      <section className="border-b border-slate-200/80 bg-slate-50/60 py-6">
        <div className="store-container grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 sm:text-sm">Manual payment verification</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">Your transfer details are reviewed before fulfilment.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Package className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 sm:text-sm">Track every order</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">Follow verification and delivery with your order ID.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Headphones className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xs font-bold text-slate-900 sm:text-sm">Human support</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">Contact us by email or WhatsApp when you need help.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--page-soft)] py-14 sm:py-18">
        <div className="store-container">
          <Reveal>
            <p className="premium-kicker">Find the right tool</p>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="max-w-2xl font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.045em] text-[var(--text)] sm:text-4xl">Choose an outcome. We’ll make the tools clear.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">Start with what you want to achieve, then compare honest package details, availability, and delivery before you order.</p>
              </div>
              <Link href="/search" className="rounded-xl border border-[var(--border-strong)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--text)] transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:text-[var(--primary)]">Search all tools <span className="ml-1 text-[var(--primary)]">→</span></Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category, index) => (
              <Reveal key={category.href} delay={index * 0.035}>
                <Link href={category.href} className="group relative flex min-h-36 flex-col justify-between overflow-hidden rounded-[1.4rem] border border-[var(--border)] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/35 hover:shadow-[0_18px_38px_rgba(16,24,39,.11)]">
                  <span className="absolute right-4 top-3 font-[family-name:var(--font-sora)] text-5xl font-semibold tracking-[-0.08em] text-[var(--primary)]/[0.07] transition group-hover:text-[var(--accent)]/[0.12]" aria-hidden="true">0{index + 1}</span>
                  <div className="relative">
                    <span className="inline-flex rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] text-[var(--primary)]">Collection</span>
                    <span className="mt-4 block font-[family-name:var(--font-sora)] text-lg font-bold tracking-[-0.025em] text-[var(--text)] transition group-hover:text-[var(--primary)]">{category.label}</span>
                  </div>
                  <span className="relative mt-4 flex items-center justify-between gap-3 text-sm text-[var(--text-muted)]"><span>{category.copy}</span><span className="text-lg font-light text-[var(--primary)] transition group-hover:translate-x-1">→</span></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {trendingProducts.length > 0 && (
        <section className="border-b border-[var(--border)] bg-white py-12 sm:py-16">
          <div className="store-container">
            <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="premium-kicker">🔥 Trending in Nepal</span>
                <h2 className="mt-3 font-[family-name:var(--font-sora)] text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl">
                  Most Popular AI &amp; Digital Tools
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">
                  Top verified subscriptions trusted by developers, creators, and professionals across Nepal.
                </p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[var(--primary)] hover:underline sm:text-sm"
              >
                View all packages →
              </Link>
            </Reveal>
            <ProductGrid products={trendingProducts} />
          </div>
        </section>
      )}

      <section id="all-products" className="scroll-mt-24 py-14 sm:py-18">
        <div className="store-container">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                BASED ON VERIFIED ORDERS
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Products with clear terms &amp; support
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
                {shopProducts.length} packages with live NPR prices. Buy approved offers online with instant Nepal payment methods or inquire on WhatsApp.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              Browse with filters →
            </Link>
          </Reveal>
          <ProductGrid products={shopProducts} />
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[linear-gradient(135deg,#f8fafc,#edf7f3)] py-14 sm:py-18">
        <div className="store-container grid gap-8 lg:grid-cols-[.92fr_1.08fr]">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">A clearer checkout</p>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.035em]">One order record from checkout to delivery.</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">TRIHEX keeps payment review, support, and fulfillment connected to the same order reference. WhatsApp remains there when you need a person, not as a replacement for your order history.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/how-it-works" variant="outline">How it works</Button>
              <Button href="/track-order" variant="secondary">Track order</Button>
            </div>
          </Reveal>
          <ol className="grid gap-3 sm:grid-cols-2">
            {HOW_IT_WORKS.map(([number, title, copy], index) => (
              <Reveal key={number} delay={index * 0.04}>
                <li className="h-full rounded-2xl border border-white/80 bg-white/85 p-5 shadow-sm">
                  <p className="font-[family-name:var(--font-sora)] text-sm font-bold text-[var(--primary)]">{number}</p>
                  <h3 className="mt-5 text-base font-bold text-[var(--text)]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{copy}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="store-container">
          <Reveal><ServicesAtlas /></Reveal>
          {services.length ? (
            <Reveal delay={0.08} className="mt-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="premium-kicker">TRIHEX services</p>
                  <h2 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.04em] text-[var(--text)]">Practical help, shaped around your work.</h2>
                </div>
                <Link href="/automation-services" className="text-sm font-bold text-[var(--primary)] hover:underline">View all services →</Link>
              </div>
              <div className="mt-6"><ProductGrid products={services.slice(0, 2)} /></div>
            </Reveal>
          ) : null}
        </div>
      </section>

      <div className="store-container">
        <Reveal>
          <HomeVaultBanner />
        </Reveal>
      </div>

      <PricingTrustSection />

      <section className="border-t border-[var(--border)] bg-[var(--page-soft)] py-14 sm:py-16">
        <div className="store-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Answers before you order</p>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.035em]">Straight answers, no confusing flow.</h2>
          </Reveal>
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            {[
              ["Is every package available for checkout?", "No. Only packages marked Available can be ordered on the site. Under Review packages are checked with TRIHEX first."],
              ["Does WhatsApp create my order?", "No. Your website order is the record. WhatsApp helps with support, payment questions, and delivery."],
              ["How do I know where my order is?", "Use Track order with your order reference and the email or Nepali mobile number used at checkout."],
              ["Are all brand relationships official?", "TRIHEX is an independent retailer. Any affiliation is stated only where it has been verified."],
            ].map(([question, answer], index) => (
              <Reveal key={question} delay={index * 0.035}>
                <div className="h-full rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[var(--text)]">{question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-sm text-[var(--text-muted)]">
              <p className="max-w-3xl">{COMPLIANCE_FOOTER_DISCLAIMER}</p>
              <a href={productEnquiryUrl("TRIHEX DIGITAL products", "general enquiry")} className="shrink-0 font-bold text-[var(--primary)] hover:underline">Need help choosing? Ask on WhatsApp →</a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
