import { JsonLd, faqJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock3, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/storefront/product-grid";
import {
  getLiveMerchandisingCatalogue,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { getProductCover } from "@/lib/catalog/product-covers";
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
  const heroCover =
    heroProduct?.coverPublicPath ??
    getProductCover(heroProduct?.slug ?? "gemini-pro-18-months-link")?.publicPath ??
    "/media/covers/gemini/gemini-pro-18-month-upgrade.webp";
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

      <section className="relative isolate overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(145deg,#f9fbff_0%,#eff6f4_55%,#ffffff_100%)]">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-90 [background:radial-gradient(circle_at_12%_16%,rgba(102,149,203,.18),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(26,133,105,.15),transparent_26%)]" />
        <div className="store-container grid min-h-[min(760px,calc(100vh-64px))] items-center gap-10 py-14 sm:py-18 lg:grid-cols-[1.02fr_.98fr] lg:py-20">
          <Reveal className="max-w-2xl">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/15 bg-white/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Nepal-first digital access
              </span>
            </div>
            <Logo href={null} size="lg" />
            <h1 className="mt-7 max-w-2xl font-[family-name:var(--font-sora)] text-4xl font-semibold tracking-[-0.045em] text-[var(--text)] text-balance sm:text-5xl lg:text-[3.65rem] lg:leading-[1.04]">
              Premium AI & Digital Tools for Nepal, built to help you move faster.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Discover AI, creator, developer, and productivity tools with clear NPR prices,
              guided website checkout, and local support that stays connected to your order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#all-products" size="lg">
                Explore live packages
              </Button>
              <Button href="/track-order" variant="outline" size="lg">
                Track an order
              </Button>
            </div>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                ["Live NPR", "Clear price before checkout"],
                ["Website record", "One order reference"],
                ["Local support", "WhatsApp when needed"],
              ].map(([value, label]) => (
                <div key={value} className="rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-[0_10px_26px_rgba(15,23,42,.06)] backdrop-blur">
                  <p className="font-[family-name:var(--font-sora)] text-sm font-bold text-[var(--text)]">{value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-7 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(15,61,110,.13),rgba(15,118,110,.12))] blur-3xl" aria-hidden="true" />
            <div className="relative rounded-[1.8rem] border border-white/80 bg-white/75 p-3 shadow-[0_28px_70px_rgba(15,23,42,.14)] backdrop-blur-xl sm:p-4">
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-[var(--page-soft)]">
                <Image
                  src={heroCover}
                  alt={heroProduct ? `${heroProduct.title} product artwork` : "TRIHEX featured product"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 540px"
                  className="object-contain p-3 transition duration-700 hover:scale-[1.025]"
                />
                <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-lg backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Featured access</p>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-[family-name:var(--font-sora)] text-base font-bold text-[var(--text)]">{heroProduct?.title ?? "Explore TRIHEX"}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{heroProduct?.packageLabel ?? "Premium digital access"}</p>
                    </div>
                    <p className="shrink-0 font-[family-name:var(--font-sora)] text-lg font-bold text-[var(--primary)]">{formatNpr(heroProduct?.priceNprMinor)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-white py-5 sm:py-6">
        <div className="store-container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [ShieldCheck, "Clear availability", "Buy online only when a package is marked Available."],
            [CreditCard, "NPR first", "See your package price before starting checkout."],
            [Clock3, "Trackable delivery", "Your order reference follows payment review and fulfillment."],
            [CheckCircle2, "Human support", `Need help? Chat with TRIHEX on WhatsApp ${getWhatsAppDisplay()}.`],
          ].map(([Icon, title, copy]) => {
            const TrustIcon = Icon as typeof ShieldCheck;
            return (
              <Reveal key={title as string} className="h-full">
                <div className="flex h-full gap-3 rounded-2xl border border-[var(--border)] bg-[var(--page-soft)] p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--primary)] shadow-sm">
                    <TrustIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">{title as string}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{copy as string}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="bg-[var(--page-soft)] py-14 sm:py-18">
        <div className="store-container">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Find the right tool</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.035em] text-[var(--text)]">Browse by what you want to achieve.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">Start with a useful category, compare live package details, then use checkout or a quick availability check.</p>
              </div>
              <Link href="/search" className="text-sm font-bold text-[var(--primary)] hover:underline">Search all tools →</Link>
            </div>
          </Reveal>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category, index) => (
              <Reveal key={category.href} delay={index * 0.035}>
                <Link href={category.href} className="group flex min-h-28 flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/35 hover:shadow-[0_16px_36px_rgba(15,23,42,.09)]">
                  <span className="text-sm font-bold text-[var(--text)] group-hover:text-[var(--primary)]">{category.label}</span>
                  <span className="mt-4 text-xs text-[var(--text-muted)]">{category.copy} <span className="ml-1 text-[var(--primary)]">→</span></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="all-products" className="scroll-mt-24 py-14 sm:py-18">
        <div className="store-container">
          <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Live catalogue</p>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.035em]">Digital access, without guesswork.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">{shopProducts.length} packages with live NPR prices. Use Buy now for approved offers or Check availability where a human confirmation is needed.</p>
            </div>
            <Link href="/products" className="rounded-xl border border-[var(--border-strong)] px-4 py-2.5 text-sm font-bold text-[var(--text)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">Open filters →</Link>
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

      <section className="py-14 sm:py-18">
        <div className="store-container grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <Reveal>
            <div className="rounded-[1.75rem] bg-[var(--primary)] p-7 text-white shadow-[0_20px_48px_rgba(15,61,110,.24)] sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">For teams and growing businesses</p>
              <h2 className="mt-3 max-w-xl font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.035em]">Need an AI workflow instead of a single tool?</h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80">Start with TRIHEX business AI setup and automation discovery. We will shape the right tools, scope, and next steps around your real workflow.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button href="/business-ai-setup" variant="secondary">Request a business AI setup</Button>
                <Button href="/automation-services" variant="outline" className="border-white/35 bg-white/5 text-white hover:bg-white/10">Explore AI services</Button>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="rounded-[1.75rem] border border-[var(--border)] bg-white p-6 shadow-soft sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--primary)]">TRIHEX services</p>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-semibold tracking-[-0.03em]">Build more than a subscription stack.</h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">Original TRIHEX assets, consulting, and workflow setup for Nepal businesses.</p>
              <div className="mt-5"><ProductGrid products={services.slice(0, 2)} /></div>
            </div>
          </Reveal>
        </div>
      </section>

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
