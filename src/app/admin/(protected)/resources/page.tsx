import { Metadata } from "next";
import Link from "next/link";
import { getAllResources } from "@/lib/resources/store";
import { Database, ShieldCheck, Download, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Resource Library Manager · TRIHEX Admin",
};

export default function AdminResourcesPage() {
  const resources = getAllResources();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Legal Content Registry
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Heavy Resource Library</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Curate tools, cheatsheets, and public datasets. Maintain strict rights tagging with zero illicit content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/resources"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <span>View Public Library</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Resources ({resources.length})</h2>
          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> All Licenses Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3.5">Resource Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Rights Tag</th>
                <th className="p-3.5">Format</th>
                <th className="p-3.5">Authority</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 max-w-sm">
                    <div className="font-semibold text-white leading-snug">{r.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{r.licenseName}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {r.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400 text-[11px]">{r.rightsTag}</td>
                  <td className="p-3.5 font-mono text-slate-300">{r.format}</td>
                  <td className="p-3.5 text-slate-400">{r.verifiedBy}</td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={`/resources/${r.slug}`}
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
