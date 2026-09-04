import { JsonLd, faqJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Clock3, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { ProductGrid } from "@/components/storefront/product-grid";
import { ServicesAtlas } from "@/components/storefront/services-atlas";
import {
  getLiveMerchandisingCatalogue,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { getProductCover } from "@/lib/catalog/product-covers";
import { getGeneratedCover } from "@/lib/catalog/generated-covers";
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
    getGeneratedCover(heroProduct?.slug ?? "gemini-pro-18-months-link", heroProduct?.brandFamily) ??
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

      <section className="relative isolate overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(145deg,#fbfdff_0%,#edf5f3_52%,#f8fafc_100%)]">
        <div className="pointer-events-none absolute inset-0 -z-10 surface-grid opacity-[0.32]" />
        <div className="pointer-events-none absolute -left-44 top-20 -z-10 h-[34rem] w-[34rem] rounded-full bg-[var(--primary)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-52 top-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="store-container grid min-h-[min(760px,calc(100vh-64px))] items-center gap-10 py-14 sm:py-18 lg:grid-cols-[1fr_.94fr] lg:py-20">
          <Reveal className="relative max-w-2xl">
            <span className="premium-kicker"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Nepal-first digital access</span>
            <div className="mt-7"><Logo href={null} size="lg" /></div>
            <h1 className="mt-7 max-w-2xl font-[family-name:var(--font-sora)] text-4xl font-semibold tracking-[-0.055em] text-[var(--text)] text-balance sm:text-5xl lg:text-[3.9rem] lg:leading-[1.01]">
              Premium AI access, made <span className="text-[var(--primary)]">simple and dependable.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Explore AI, creator, developer, and productivity tools with clear NPR prices, website checkout, and a local support layer that remains connected to your order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#all-products" size="lg">Explore live packages</Button>
              <Button href="/track-order" variant="outline" size="lg">Track an order</Button>
            </div>
            <div className="mt-9 grid max-w-xl overflow-hidden rounded-[1.35rem] border border-white/90 bg-white/70 shadow-[0_18px_46px_rgba(16,24,39,.08)] backdrop-blur sm:grid-cols-3">
              {[
                ["Live NPR", "Clear price before checkout"],
                ["Website record", "One reference from payment to delivery"],
                ["Local support", "A person when you need one"],
              ].map(([value, label], index) => (
                <div key={value} className={`p-4 ${index ? "border-t border-[var(--border)] sm:border-l sm:border-t-0" : ""}`}>
                  <p className="font-[family-name:var(--font-sora)] text-sm font-bold text-[var(--text)]">{value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1} className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-8 rounded-[3rem] bg-[conic-gradient(from_210deg,rgba(15,76,129,.16),rgba(118,86,255,.16),rgba(12,132,105,.13),rgba(15,76,129,.16))] blur-3xl" aria-hidden="true" />
            <Link
              href={heroProduct ? `/products/${heroProduct.slug}` : "/products"}
              className="group block relative rounded-[2rem] border border-white/90 bg-white/80 p-3 shadow-premium backdrop-blur-xl transition duration-300 hover:border-[var(--primary)]/40 hover:shadow-2xl sm:p-4"
            >
              <div className="relative aspect-square overflow-hidden rounded-[1.45rem] bg-[linear-gradient(145deg,#eaf0f7,#f9fbff)]">
                <Image
                  src={heroCover}
                  alt={heroProduct ? `${heroProduct.title} product artwork` : "TRIHEX featured product"}
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 540px"
                  className="object-contain p-3 transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/60 bg-[var(--surface-ink)]/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white shadow-lg backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ee6b9] shadow-[0_0_0_4px_rgba(78,230,185,.16)]" /> Ready to order
                </div>
                <div className="absolute inset-x-3 bottom-3 rounded-[1.2rem] border border-white/80 bg-white/93 p-4 shadow-xl backdrop-blur transition duration-300 group-hover:bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">★ Featured Official Access</p>
                      <p className="mt-1 font-[family-name:var(--font-sora)] text-lg font-bold text-[var(--text)] transition group-hover:text-[var(--primary)]">{heroProduct?.title ?? "Explore TRIHEX"}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{heroProduct?.packageLabel ?? "Premium digital access"} · Click to view details & plans →</p>
                    </div>
                    <p className="shrink-0 rounded-xl bg-[var(--primary-soft)] px-3 py-2 font-[family-name:var(--font-sora)] text-lg font-bold text-[var(--primary)]">{formatNpr(heroProduct?.priceNprMinor)}</p>
                  </div>
                </div>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Live Verified Deals Ticker Bar */}
      <section className="border-b border-[var(--border)] bg-[linear-gradient(90deg,#0a192f_0%,#0f172a_100%)] py-3 text-white">
        <div className="store-container flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
            <Sparkles className="h-3 w-3" /> Live Deals
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
            {[
              { name: "Gemini AI Pro 18M", price: "Rs. 399", slug: "gemini-pro-18-months-link", badge: "92% Off" },
              { name: "CapCut Pro", price: "From Rs. 299", slug: "capcut-pro", badge: "Hot" },
              { name: "Claude Code Unlimited", price: "From Rs. 1,299", slug: "claude-code-api-access", badge: "New" },
              { name: "ElevenLabs Creator", price: "From Rs. 2,699", slug: "elevenlabs-creator-shared", badge: "Popular" },
              { name: "Cursor Pro Editor", price: "From Rs. 1,999", slug: "cursor-pro-12m", badge: "Dev" },
              { name: "Manus AI Pro 12M", price: "Rs. 9,679", slug: "manus-ai-pro-12m", badge: "Agentic" },
              { name: "Higgsfield Pro 12M", price: "Rs. 17,999", slug: "higgsfield-pro-12m", badge: "Video" },
              { name: "Warp Build 1 Year", price: "Rs. 3,699", slug: "warp-build-1-year", badge: "20x Fast" },
              { name: "n8n Starter 1 Year", price: "Rs. 4,699", slug: "n8n-starter-1-year", badge: "Workflow" },
              { name: "Veo 3 Ultra Credits", price: "Rs. 2,999", slug: "veo3-ultra-flow-credits", badge: "45K Creds" },
            ].map((deal) => (
              <Link
                key={deal.slug}
                href={`/products/${deal.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 transition hover:border-emerald-400/50 hover:bg-white/10 hover:text-emerald-300"
              >
                <span>{deal.name}</span>
                <span className="font-bold text-emerald-400">{deal.price}</span>
                <span className="rounded bg-white/20 px-1 py-0.5 text-[9px] font-extrabold uppercase text-white/90">
                  {deal.badge}
                </span>
              </Link>
            ))}
          </div>
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

      <section id="all-products" className="scroll-mt-24 py-14 sm:py-18">
        <div className="store-container">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="premium-kicker">Live catalogue</p>
              <h2 className="mt-4 font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.045em] text-[var(--text)] sm:text-4xl">Digital access, without guesswork.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">{shopProducts.length} packages with live NPR prices. Buy approved offers online, or check availability with a person when a package needs confirmation.</p>
            </div>
            <Link href="/products" className="rounded-xl bg-[var(--surface-ink)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--primary)]">Browse with filters →</Link>
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
