import { Metadata } from "next";
import { getAllResources } from "@/lib/resources/store";
import { ResourceHub } from "@/components/resources/resource-hub";
import { ShieldCheck, Database, FileText, Lock, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Heavy Resource Library · Security Advisories, Cheat Sheets & Public Datasets",
  description:
    "Curated legal developer tools, CISA KEV security bulletins, Linux cheat sheets, and Nepal public open datasets. Strict license provenance with zero illegal leaks.",
  openGraph: {
    title: "TRIHEX Heavy Resource Library",
    description: "Curated developer tools, CISA KEV security advisories, and Nepal civic datasets with verified provenance.",
    url: "https://trihexdigital.shop/resources",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/resources",
  },
};

export default function ResourcesPage() {
  const resources = getAllResources();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 p-6 sm:p-10 mb-8 shadow-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Heavy Resource Library
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strict Rights Tagging · Zero Leaks or Dumps
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Developer Cheat Sheets, CVE Advisories &amp; Open Datasets
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Curated technical references, government open census records, CISA known exploited vulnerability catalogs, and architecture cheat sheets with verified licenses.
          </p>
        </div>

        <ResourceHub initialResources={resources} />
      </div>
    </main>
  );
}
