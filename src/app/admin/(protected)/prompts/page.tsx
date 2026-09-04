import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-header";
import { getAllPrompts } from "@/lib/prompts/store";
import { Sparkles, ExternalLink, Code2, Copy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPromptsPage() {
  const prompts = getAllPrompts();

  const originalCount = prompts.filter((p) => p.isOriginalTrihex).length;
  const communityCount = prompts.filter((p) => !p.isOriginalTrihex).length;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Prompt Intelligence Library"
        description="Manage original curated TRIHEX prompts and synced CC0 prompts.chat templates. All variables are dynamically extracted and validated."
        actions={
          <div className="flex gap-2">
            <Link
              href="/prompts"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-text hover:bg-surface-raised transition"
            >
              Public Hub <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-text-muted">Total Prompts</div>
          <div className="text-2xl font-bold text-text mt-0.5">{prompts.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-cyan-600 font-medium">TRIHEX Originals</div>
          <div className="text-2xl font-bold text-cyan-700 mt-0.5">{originalCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-indigo-600 font-medium">prompts.chat Archive</div>
          <div className="text-2xl font-bold text-indigo-700 mt-0.5">{communityCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
          <div className="text-xs text-emerald-600 font-medium">Total Variables</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">
            {prompts.reduce((sum, p) => sum + p.variables.length, 0)}
          </div>
        </div>
      </div>

      {/* Prompts Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-raised/60 text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-3">Title & Category</th>
              <th className="px-4 py-3">Provenance</th>
              <th className="px-4 py-3">Variables</th>
              <th className="px-4 py-3">Models</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {prompts.map((p) => (
              <tr key={p.id} className="hover:bg-surface-raised/30 transition">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-text">{p.title}</div>
                  <div className="text-xs text-text-muted mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                      {p.category}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-xs">{p.description}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {p.isOriginalTrihex ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                      TRIHEX Original
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      prompts.chat (CC0)
                    </span>
                  )}
                  <div className="text-[11px] text-text-muted mt-0.5">{p.author}</div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="text-xs font-semibold text-text">
                    {p.variables.length} vars
                  </span>
                  {p.variables.length > 0 && (
                    <div className="text-[10px] text-text-muted font-mono">
                      {p.variables.map((v) => v.name).slice(0, 2).join(", ")}
                      {p.variables.length > 2 && "…"}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {p.modelCompatibility.slice(0, 2).map((m) => (
                      <span key={m} className="px-1.5 py-0.5 rounded text-[10px] bg-surface border border-border text-text-muted">
                        {m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <Link
                    href={`/prompts/${p.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary-soft text-primary hover:bg-primary/20 transition"
                  >
                    Open Playground
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
