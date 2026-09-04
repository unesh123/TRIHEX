import Link from "next/link";
import { getAllPrompts } from "@/lib/prompts/store";
import { getPublishedDeals } from "@/lib/deals/store";
import { getAllNews } from "@/lib/news/store";
import { CopyButton } from "@/components/ui/copy-button";
import { 
  Sparkles, 
  Gift, 
  Newspaper, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Terminal,
  ExternalLink,
  Flame
} from "lucide-react";
import type { MerchCard } from "@/lib/catalog/merchandising";

interface PDPIntelligenceHubProps {
  product: MerchCard;
}

export function PDPIntelligenceHub({ product }: PDPIntelligenceHubProps) {
  // 1. Match Prompts
  const allPrompts = getAllPrompts();
  const queryWords = [
    product.slug.toLowerCase(),
    product.brandName.toLowerCase(),
    product.categorySlug.toLowerCase(),
    ...(product.brandFamily ? [product.brandFamily.toLowerCase()] : []),
  ];

  let matchedPrompts = allPrompts.filter((p) => {
    const text = `${p.title} ${p.description} ${p.tags.join(" ")} ${p.category}`.toLowerCase();
    return queryWords.some((w) => w.length > 2 && text.includes(w));
  });

  if (matchedPrompts.length < 3) {
    const fallbackPrompts = allPrompts.filter(
      (p) => !matchedPrompts.some((m) => m.id === p.id)
    );
    matchedPrompts = [...matchedPrompts, ...fallbackPrompts].slice(0, 3);
  } else {
    matchedPrompts = matchedPrompts.slice(0, 3);
  }

  // 2. Match Deals
  const allDeals = getPublishedDeals();
  const relatedDeals = allDeals.slice(0, 2);

  // 3. Match News
  const allNews = getAllNews();
  const relatedNews = allNews.slice(0, 2);

  return (
    <section className="mt-12 space-y-10 border-t border-[var(--border)] pt-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
          <Sparkles className="h-4 w-4" />
          <span>TRIHEX Intelligence Hub</span>
        </div>
        <h2 className="mt-1.5 font-[family-name:var(--font-sora)] text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
          Ecosystem Assets &amp; Procurement Standards
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--text-muted)]">
          Maximize the value of {product.title} with curated engineering prompt templates, verified ecosystem perks, tech news, and compliance benchmarks.
        </p>
      </div>

      {/* Grid of Hub Cards: Prompts, Perks, News */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Module 1: Prompt Workflows */}
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <Terminal className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Curated Prompts</h3>
            </div>
            <Link
              href="/prompts"
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Production-tested AI prompts engineered for {product.title} workflows:
          </p>

          <div className="mt-3 flex-1 space-y-3">
            {matchedPrompts.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)]/50 p-3 transition hover:border-[var(--primary)]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-[var(--border)]">
                    {p.category}
                  </span>
                  <CopyButton textToCopy={p.content} size="sm" />
                </div>
                <Link
                  href={`/prompts/${p.slug}`}
                  className="mt-2 block text-xs font-bold text-[var(--text)] line-clamp-1 hover:text-[var(--primary)] hover:underline"
                >
                  {p.title}
                </Link>
                <p className="mt-1 text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Module 2: Verified Deals & Perks */}
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <Gift className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Verified Perks &amp; Deals</h3>
            </div>
            <Link
              href="/deals"
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Radar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Legitimate student, startup, and developer credits verified active:
          </p>

          <div className="mt-3 flex-1 space-y-3">
            {relatedDeals.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)]/50 p-3 transition hover:border-[var(--primary)]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                    {d.dealType.replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {d.vendor}
                  </span>
                </div>
                <h4 className="mt-2 text-xs font-bold text-[var(--text)] line-clamp-1">
                  {d.title}
                </h4>
                <p className="mt-1 text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {d.summary}
                </p>
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[var(--border)]/60 text-[11px]">
                  <span className="text-emerald-700 font-semibold">
                    {d.detectedValueNprMinor ? `NPR ${(d.detectedValueNprMinor / 100).toLocaleString("en-NP")} Value` : "Free Tier"}
                  </span>
                  <a
                    href={d.officialVendorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
                  >
                    Official Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Module 3: Industry & Ecosystem News */}
        <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-600">
                <Newspaper className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">Ecosystem News</h3>
            </div>
            <Link
              href="/news"
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              News <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <p className="mt-3 text-xs text-[var(--text-muted)]">
            Corroborated tech headlines and regulatory developments:
          </p>

          <div className="mt-3 flex-1 space-y-3">
            {relatedNews.map((n) => (
              <div
                key={n.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--page-soft)]/50 p-3 transition hover:border-[var(--primary)]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700 border border-cyan-200">
                    {n.category.replace("_", " ")}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                    <Flame className="h-3 w-3" />
                    {n.hotScore} Hot
                  </span>
                </div>
                <Link
                  href={`/news/${n.slug}`}
                  className="mt-2 block text-xs font-bold text-[var(--text)] line-clamp-1 hover:text-[var(--primary)] hover:underline"
                >
                  {n.title}
                </Link>
                <p className="mt-1 text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {n.excerpt}
                </p>
                <p className="mt-2 text-[10px] text-slate-400">
                  Source: {n.source} · {new Date(n.publishedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module 4: Nepal Procurement Standards Comparison Matrix */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="font-[family-name:var(--font-sora)] text-base font-bold text-[var(--text)]">
            Nepal Software Procurement: Why Choose TRIHEX DIGITAL?
          </h3>
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Compare our official, law-abiding digital fulfillment infrastructure against informal gray-market resellers in Nepal.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--page-soft)]/60 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="p-3">Evaluation Pillar</th>
                <th className="p-3 text-emerald-700">TRIHEX DIGITAL (Verified)</th>
                <th className="p-3 text-slate-500">Informal Gray Market / Telegram</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              <tr>
                <td className="p-3 font-semibold text-slate-800">License Authenticity</td>
                <td className="p-3 text-emerald-800 font-medium">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>100% Genuine direct license / team seat allocated directly to your work email.</span>
                  </div>
                </td>
                <td className="p-3 text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>Shared logins, stolen credentials, cracked bins that get revoked within days.</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Payment &amp; Currency</td>
                <td className="p-3 text-emerald-800 font-medium">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>NPR bank QR, eSewa, and Khalti via official merchant integration. No dollar card needed.</span>
                  </div>
                </td>
                <td className="p-3 text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>Personal wallets, crypto transfers, or unauthorized card charges with zero buyer protection.</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Tax &amp; Compliance</td>
                <td className="p-3 text-emerald-800 font-medium">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>Official IRD-compliant VAT / PAN Tax Invoice issued for corporate expense write-offs.</span>
                  </div>
                </td>
                <td className="p-3 text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>Zero tax invoices. Exposes buyers to company audit disallowance and liability.</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Warranty &amp; Replacement</td>
                <td className="p-3 text-emerald-800 font-medium">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>Full term warranty guarantee. Instant replacement or prorated refund if service fails.</span>
                  </div>
                </td>
                <td className="p-3 text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>Seller ignores messages or deletes chat after receiving payment.</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-800">Data Privacy</td>
                <td className="p-3 text-emerald-800 font-medium">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>Strict individual privacy. Your data, prompts, and files remain private to your team.</span>
                  </div>
                </td>
                <td className="p-3 text-slate-500">
                  <div className="flex items-start gap-1.5">
                    <XCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>Shared master password exposes your prompts, code snippets, and customer data.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
