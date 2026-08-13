import { JsonLd, faqJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/storefront/product-grid";
import {
  getLiveMerchandisingCatalogue,
  withFamilyGrouping,
} from "@/lib/catalog/merchandising";
import { getProductCover } from "@/lib/catalog/product-covers";
import {
  getWhatsAppDisplay,
  productEnquiryUrl,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";
import { COMPLIANCE_FOOTER_DISCLAIMER } from "@/lib/compliance/gate";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Premium AI & Digital Tools for Nepal",
  description:
    "Buy ChatGPT, Gemini, CapCut, Canva and more in Nepal. Transparent NPR prices, bank QR checkout, payment proof upload, and WhatsApp support.",
  alternates: { canonical: "/" },
};

const CATEGORIES = [
  { href: "/ai-tools-nepal", label: "AI Assistants" },
  { href: "/categories/design", label: "Design & Creative" },
  { href: "/categories/video-editing", label: "Video & Editing" },
  { href: "/categories/developer-tools", label: "Developer Tools" },
  { href: "/categories/learning", label: "Learning" },
  { href: "/categories/productivity", label: "Productivity" },
  { href: "/categories/services", label: "TRIHEX Services" },
];

export default async function HomePage() {
  const all = await getLiveMerchandisingCatalogue();
  const clean = all.filter((p) => {
    const title = (p.title ?? "").toLowerCase();
    const slug = (p.slug ?? "").toLowerCase();
    // Hide obvious draft / typo / internal test listings
    if (title.includes("moths")) return false;
    if (title.includes("(plan)") && title.includes("super grok 6")) return false;
    if (slug.includes("trihex-test-sku") || title.includes("test sku")) return false;
    if (p.visibility === "BLOCKED") return false;
    return true;
  });

  // Full shop catalogue on homepage (duration families collapsed)
  const catalogue = withFamilyGrouping(clean).sort((a, b) => {
    const buyRank = (p: (typeof clean)[number]) => {
      if (p.purchasable && p.visibility === "AVAILABLE") return 0;
      if (p.visibility === "AVAILABLE") return 1;
      if (p.visibility === "AVAILABILITY_UNDER_REVIEW") return 2;
      if (p.visibility === "OUT_OF_STOCK") return 3;
      return 4;
    };
    const d = buyRank(a) - buyRank(b);
    if (d !== 0) return d;
    if (a.featured !== b.featured) return Number(b.featured) - Number(a.featured);
    return (a.priceNprMinor ?? Number.MAX_SAFE_INTEGER) -
      (b.priceNprMinor ?? Number.MAX_SAFE_INTEGER);
  });

  const services = catalogue.filter(
    (p) =>
      p.brandSlug === "trihex" &&
      (p.categorySlug === "services" || p.categorySlug === "digital-assets"),
  );
  const shopProducts = catalogue.filter(
    (p) =>
      !(
        p.brandSlug === "trihex" &&
        (p.categorySlug === "services" || p.categorySlug === "digital-assets")
      ),
  );

  const heroProduct =
    shopProducts.find((p) => p.slug.includes("gemini-pro-18")) ??
    shopProducts.find((p) => p.purchasable) ??
    shopProducts[0];
  const heroCover =
    heroProduct?.coverPublicPath ??
    getProductCover(heroProduct?.slug ?? "gemini-pro-18-months-link")
      ?.publicPath ??
    "/media/covers/gemini/gemini-pro-18-month-upgrade.webp";

  const waUrl = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I want to explore AI and digital tools for Nepal.",
  );

  return (
    <div>
      <JsonLd
        data={faqJsonLd([
          {
            question: "Is every product available for checkout?",
            answer:
              "No. Only approved packages show Buy Now. Others appear as Under Review or Unavailable.",
          },
          {
            question: "Does WhatsApp create my order?",
            answer:
              "No. The website is the system of record. WhatsApp is for support and verification only.",
          },
          {
            question: "Are you an official partner of every brand?",
            answer:
              "No. TRIHEX DIGITAL is an independent retailer. Affiliation is stated only where verified.",
          },
          {
            question: "How do I get support?",
            answer: `Chat on WhatsApp ${getWhatsAppDisplay()} or use Track Order after placing a website order.`,
          },
        ])}
      />
      <section className="relative overflow-hidden border-b border-[var(--border)]">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,#e8eef8_0%,transparent_55%),radial-gradient(ellipse_at_80%_10%,#e6f4ef_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#ffffff_70%)]"
          aria-hidden
        />
        <div className="store-container relative grid min-h-[88vh] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="relative z-10 max-w-xl">
            <div className="mb-6">
              <Logo href={null} size="lg" />
            </div>
            <h1 className="font-[family-name:var(--font-sora)] text-4xl font-semibold tracking-tight text-[var(--text)] text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.08]">
              Premium AI & Digital Tools for Nepal
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Transparent NPR prices, website checkout, and local WhatsApp
              support — order online, pay securely, get verified fulfillment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="#all-products" size="lg">
                Shop all products
              </Button>
              <Button href={waUrl} external variant="whatsapp" size="lg">
                WhatsApp {getWhatsAppDisplay()}
              </Button>
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              {shopProducts.length} packages live on this page · scroll to browse
              everything.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="absolute -inset-6 rounded-[2rem] bg-[linear-gradient(135deg,rgba(15,61,110,0.08),rgba(13,148,136,0.12))] blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-white/80 p-4 shadow-[0_24px_60px_rgba(17,24,39,0.12)] backdrop-blur-sm animate-[fadeUp_0.7s_ease_both]">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--page-soft)]">
                <Image
                  src={heroCover}
                  alt={
                    heroProduct
                      ? `${heroProduct.title} cover`
                      : "TRIHEX featured product"
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 90vw, 480px"
                  className="object-contain p-4 transition duration-700 hover:scale-[1.03]"
                />
              </div>
              {heroProduct ? (
                <div className="mt-4 flex items-end justify-between gap-3 px-1">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                      Starting from
                    </p>
                    <p className="font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
                      {heroProduct.title}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {heroProduct.packageLabel}
                    </p>
                  </div>
                  {heroProduct.priceNprMinor != null ? (
                    <p className="font-[family-name:var(--font-sora)] text-xl font-semibold text-[var(--text)]">
                      Rs. {Math.round(heroProduct.priceNprMinor / 100).toLocaleString("en-NP")}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--border)] bg-white py-6">
        <div className="store-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: "Not everything is Buy Now",
              d: "Only Available packages checkout online. Under Review needs WhatsApp first.",
            },
            {
              t: "Pay with your bank QR",
              d: "Scan TRIHEX bank QR at checkout, pay exact NPR, upload proof.",
            },
            {
              t: "Website is the order of record",
              d: "WhatsApp supports you — orders start on the website.",
            },
            {
              t: "Nepal-friendly pricing",
              d: "Clear NPR prices with big savings vs list package prices.",
            },
          ].map((item) => (
            <div key={item.t} className="rounded-xl bg-[var(--page-soft)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--text)]">{item.t}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                {item.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--page-soft)] py-12">
        <div className="store-container">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-semibold text-[var(--text)]">
            Shop by category
          </h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--text)] shadow-sm transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="all-products" className="scroll-mt-24 py-14">
        <div className="store-container">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-2xl font-semibold">
                All products
              </h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Full TRIHEX catalogue — {shopProducts.length} packages with live
                NPR prices. Buy Now or Check Availability on each card.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-[var(--primary)]"
            >
              Open full catalogue filters →
            </Link>
          </div>
          <ProductGrid products={shopProducts} />
        </div>
      </section>

      <section className="bg-[var(--page-soft)] py-14">
        <div className="store-container">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-semibold">
            How ordering works
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Choose a product and package",
              "Buy Now or checkout on the website",
              "Pay by eSewa, Khalti, or bank QR",
              "Upload payment proof",
              "TRIHEX verifies funds",
              "Activation / delivery follows",
            ].map((step, i) => (
              <li
                key={step}
                className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                  Step {i + 1}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--text)]">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[linear-gradient(135deg,#f8fafc,#eef6f3)] py-14">
        <div className="store-container grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-semibold">
              Pricing transparency
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              Final NPR prices are shown before checkout. Duration, delivery
              estimate, and eligibility sit on each product page. Supplier cost
              stays internal.
            </p>
            <Button href="/pricing-transparency" variant="outline" className="mt-5">
              See how we price
            </Button>
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-sora)] text-2xl font-semibold">
              TRIHEX services
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Original TRIHEX digital assets and consulting for Nepal businesses.
            </p>
            <div className="mt-5">
              <ProductGrid products={services} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="store-container">
          <h2 className="font-[family-name:var(--font-sora)] text-2xl font-semibold">
            FAQ
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              {
                q: "Is every product available for checkout?",
                a: "No. Only approved packages show Buy Now. Others appear as Under Review or Unavailable.",
              },
              {
                q: "Does WhatsApp create my order?",
                a: "No. The website is the system of record. WhatsApp is for support and verification only.",
              },
              {
                q: "Are you an official partner of every brand?",
                a: "No. TRIHEX DIGITAL is an independent retailer. Affiliation is stated only where verified.",
              },
              {
                q: "How do I get support?",
                a: `Chat on WhatsApp ${getWhatsAppDisplay()} or use Track Order after placing a website order.`,
              },
            ].map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-[var(--border)] bg-white p-5"
              >
                <h3 className="font-semibold text-[var(--text)]">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-[var(--text-muted)]">
            {COMPLIANCE_FOOTER_DISCLAIMER}
          </p>
          <a
            href={productEnquiryUrl("TRIHEX DIGITAL products", "general enquiry")}
            className="mt-4 inline-flex text-sm font-semibold text-[var(--primary)]"
          >
            Need help choosing? Ask on WhatsApp
          </a>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Read our{" "}
            <Link href="/blog" className="font-semibold text-[var(--primary)] hover:underline">
              Nepal AI & digital tools guides
            </Link>{" "}
            for ChatGPT, Gemini, CapCut, and payment help.
          </p>
        </div>
      </section>
    </div>
  );
}
