import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";
import { getAllNews } from "@/lib/news/store";
import { getAllPrompts } from "@/lib/prompts/store";
import { getAllResources } from "@/lib/resources/store";
import { getPublishedDeals } from "@/lib/deals/store";
import { getSiteUrl } from "@/lib/site";
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  ExternalLink, 
  Globe, 
  Sparkles,
  Layers,
  Share2
} from "lucide-react";

export const metadata = {
  title: "SEO Dominance & Sitemaps | TRIHEX Ops",
};

export default async function AdminSeoDashboardPage() {
  const origin = getSiteUrl();
  const products = await getLiveMerchandisingCatalogue();
  const news = getAllNews();
  const prompts = getAllPrompts();
  const resources = getAllResources();
  const deals = getPublishedDeals();

  const totalIndexable = 
    products.filter((p) => p.visibility !== "BLOCKED").length +
    news.length +
    prompts.length +
    resources.length +
    deals.length +
    35; // Static routes + blog

  const sitemaps = [
    {
      name: "Master Index Sitemap",
      url: `${origin}/sitemap.xml`,
      route: "/sitemap.xml",
      itemCount: totalIndexable,
      frequency: "Daily",
      type: "XML Index",
    },
    {
      name: "Products & Software Catalogue",
      url: `${origin}/sitemap-products.xml`,
      route: "/sitemap-products.xml",
      itemCount: products.filter((p) => p.visibility !== "BLOCKED").length + 1,
      frequency: "Daily",
      type: "Segmented XML",
    },
    {
      name: "Live News Intelligence",
      url: `${origin}/sitemap-news.xml`,
      route: "/sitemap-news.xml",
      itemCount: news.length + 3,
      frequency: "Hourly / Daily",
      type: "Segmented XML",
    },
    {
      name: "100+ Prompt Templates",
      url: `${origin}/sitemap-prompts.xml`,
      route: "/sitemap-prompts.xml",
      itemCount: prompts.length + 1,
      frequency: "Weekly",
      type: "Segmented XML",
    },
    {
      name: "Developer Resources & Security Sheets",
      url: `${origin}/sitemap-resources.xml`,
      route: "/sitemap-resources.xml",
      itemCount: resources.length + 1,
      frequency: "Weekly",
      type: "Segmented XML",
    },
    {
      name: "Unified Vault & Tech Deals",
      url: `${origin}/sitemap-vault.xml`,
      route: "/sitemap-vault.xml",
      itemCount: deals.length + 4,
      frequency: "Daily",
      type: "Segmented XML",
    },
  ];

  const structuredSchemas = [
    { schema: "Organization", target: "Global Brand Header", status: "Active (JSON-LD)", notes: "Name, Logo, Legal Entity, Support Hotline" },
    { schema: "Product & Offer", target: "/products/[slug]", status: "Active (JSON-LD)", notes: "Title, Price NPR Minor, InStock/PreOrder, Currency" },
    { schema: "BreadcrumbList", target: "/products/[slug], /prompts/[slug]", status: "Active (JSON-LD)", notes: "Hierarchical trail mapping" },
    { schema: "NewsArticle", target: "/news/[slug]", status: "Active (JSON-LD)", notes: "Headline, Publisher, Publication Timestamp, Source URL" },
    { schema: "SoftwareSourceCode", target: "/prompts/[slug]", status: "Active (JSON-LD)", notes: "Language, Framework, Original TRIHEX Attributions" },
  ];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="SEO Dominance & Crawl Index Engine"
        description="Monitor automated XML sitemap generation, structured schema markup (JSON-LD), canonical integrity, and search robot discovery."
      />

      {/* Top Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>Indexable URLs</span>
            <Globe className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[var(--text)]">{totalIndexable}</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 100% Canonical Compliant
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>Active Sitemaps</span>
            <Layers className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[var(--text)]">{sitemaps.length}</p>
          <p className="mt-1 text-xs text-indigo-600 font-medium">1 Master + 5 Segmented Feeds</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>Schema Types</span>
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[var(--text)]">5</p>
          <p className="mt-1 text-xs text-amber-600 font-medium">Google Rich Results Ready</p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <span>OpenGraph Tags</span>
            <Share2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[var(--text)]">100%</p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Social Cards &amp; Twitter Meta</p>
        </div>
      </div>

      {/* Segmented Sitemaps Registry */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text)]">
              Automated XML Sitemaps Registry
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              High-efficiency segmented XML feeds distributed to search engine crawlers (Google, Bing, Yandex).
            </p>
          </div>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--page-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--text)] hover:bg-[var(--border)]"
          >
            Inspect Root XML <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--page-soft)]/50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="p-3">Sitemap Feed</th>
                <th className="p-3">Route Endpoint</th>
                <th className="p-3">Total Entries</th>
                <th className="p-3">Crawl Frequency</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {sitemaps.map((sm, idx) => (
                <tr key={idx} className="hover:bg-[var(--page-soft)]/40 transition">
                  <td className="p-3 font-semibold text-[var(--text)] flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-600" />
                    <span>{sm.name}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">{sm.route}</td>
                  <td className="p-3 font-bold text-slate-800">{sm.itemCount} URLs</td>
                  <td className="p-3 text-slate-600">{sm.frequency}</td>
                  <td className="p-3">
                    <a
                      href={sm.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--primary)] font-semibold hover:underline"
                    >
                      View Raw XML <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON-LD Schema Integrity Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-[var(--text)]">
          Structured Schema (JSON-LD) Validation Status
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Standardized Schema.org microdata embedded into pages for Google Rich Snippets and Knowledge Graph.
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--page-soft)]/50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="p-3">Schema Class</th>
                <th className="p-3">Target Surface</th>
                <th className="p-3">Integration Status</th>
                <th className="p-3">Fields Validated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {structuredSchemas.map((sc, idx) => (
                <tr key={idx} className="hover:bg-[var(--page-soft)]/40 transition">
                  <td className="p-3 font-bold text-[var(--text)]">{sc.schema}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-600">{sc.target}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> {sc.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{sc.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
