import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { getResourceBySlug, getAllResources } from "@/lib/resources/store";
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Tag 
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ResourceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ResourceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) return { title: "Resource Not Found" };

  return {
    title: `${resource.title} · TRIHEX Resources`,
    description: resource.summary,
    alternates: { canonical: `https://trihexdigital.shop/resources/${resource.slug}` },
  };
}

export default async function ResourceDetailPage({
  params,
}: ResourceDetailPageProps) {
  const { slug } = await params;
  const resource = getResourceBySlug(slug);
  if (!resource) notFound();

  const related = getAllResources({ category: resource.category })
    .filter((r) => r.slug !== resource.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Resources
          </Link>
        </div>

        <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-10 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {resource.category.replace("_", " ")}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                {resource.rightsTag}
              </span>
            </div>

            <span className="text-slate-400 font-mono text-[11px]">
              Format: {resource.format}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            {resource.title}
          </h1>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 text-slate-200 text-sm leading-relaxed">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Resource Summary &amp; Scope
            </div>
            <p>{resource.summary}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
              <div className="text-slate-500 font-mono text-[10px] uppercase">Official License</div>
              <div className="font-semibold text-white">{resource.licenseName}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-1">
              <div className="text-slate-500 font-mono text-[10px] uppercase">Verified Curator</div>
              <div className="font-semibold text-white">{resource.verifiedBy}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            {resource.downloadUrl && (
              <a
                href={resource.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Download className="w-4 h-4" />
                <span>Direct Download ({resource.format})</span>
              </a>
            )}

            <a
              href={resource.officialUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition"
            >
              <span>Official Authority Page</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </article>

        {related.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-lg font-bold text-white">Related Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/resources/${item.slug}`}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-blue-500/40 transition block space-y-1.5"
                >
                  <span className="text-[10px] font-mono text-cyan-400">{item.rightsTag}</span>
                  <h4 className="text-xs font-bold text-white line-clamp-2">{item.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
