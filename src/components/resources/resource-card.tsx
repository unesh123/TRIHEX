import Link from "next/link";
import { ResourceItem, ResourceRightsTag } from "@/lib/resources/types";
import { ShieldCheck, FileText, Download, ExternalLink, ArrowRight, Tag } from "lucide-react";

interface ResourceCardProps {
  resource: ResourceItem;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getRightsTagStyle = (tag: ResourceRightsTag) => {
    switch (tag) {
      case "PUBLIC_DOMAIN":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "OPEN_LICENSE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "TRIHEX_ORIGINAL":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/30";
      case "LINK_ONLY":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-blue-500/40 hover:bg-slate-900/90 transition shadow-md group">
      <div className="space-y-3">
        {/* Top metadata */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border font-mono ${getRightsTagStyle(resource.rightsTag)}`}>
            {resource.rightsTag.replace("_", " ")}
          </span>

          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
            {resource.format}
          </span>
        </div>

        {/* Title */}
        <Link href={`/resources/${resource.slug}`}>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition leading-snug">
            {resource.title}
          </h3>
        </Link>

        {/* Summary */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
          {resource.summary}
        </p>

        {/* License */}
        <div className="text-[11px] text-slate-400 font-mono">
          License: <span className="text-slate-300">{resource.licenseName}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
          {resource.verifiedBy}
        </span>

        <div className="flex items-center gap-2">
          {resource.downloadUrl && (
            <a
              href={resource.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Direct Download"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
          <Link
            href={`/resources/${resource.slug}`}
            className="inline-flex items-center gap-1 font-semibold text-blue-400 hover:text-blue-300 text-xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </article>
  );
}
