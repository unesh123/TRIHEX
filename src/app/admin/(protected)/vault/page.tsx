import { AdminHeader } from "@/components/admin/admin-header";
import { getAllVaultEntries } from "@/lib/vault/vault-aggregator";
import { getAllDealCandidates } from "@/lib/deals/store";
import { getAllPrompts } from "@/lib/prompts/store";
import { getAllResearchItems } from "@/lib/vault/research-registry";
import Link from "next/link";
import { 
  Terminal, 
  Tag, 
  Sparkles, 
  FileText, 
  ExternalLink, 
  ShieldCheck, 
  Gift, 
  Layers,
  ArrowRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unified Vault Manager · TRIHEX Admin",
};

export default function AdminVaultPage() {
  const vaultEntries = getAllVaultEntries();
  const deals = getAllDealCandidates();
  const prompts = getAllPrompts();
  const research = getAllResearchItems();

  const dealsCount = vaultEntries.filter((e) => e.category === "DEAL").length;
  const promptsCount = vaultEntries.filter((e) => e.category === "PROMPT").length;
  const researchCount = vaultEntries.filter((e) => e.category === "RESEARCH").length;
  const perksCount = vaultEntries.filter((e) => e.category === "FREE_TOOL").length;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Unified Flagship Vault Manager"
        description="Unified administration for TRIHEX discovery drops: Verified developer deals, prompt intelligence toolkits, public research briefings, and free cloud credits."
      />

      {/* Aggregate Counts & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Verified Deals</span>
            <Tag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{dealsCount} Active</div>
          <Link
            href="/admin/deal-radar"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Manage Deals Radar</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Prompt Toolkits</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{promptsCount} Active</div>
          <Link
            href="/admin/prompts"
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300"
          >
            <span>Manage Prompts</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Research Drops</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{researchCount} Verified</div>
          <span className="text-xs text-slate-500 font-mono">NRB / USGS / NSO</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Free Perks</span>
            <Gift className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{perksCount} Verified</div>
          <span className="text-xs text-slate-500 font-mono">Zero-Cost Cloud</span>
        </div>
      </div>

      {/* Vault Inventory Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white">Live Vault Catalog ({vaultEntries.length} Items)</h2>
          </div>
          <Link
            href="/vault"
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <span>Open Public Vault</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-white/5">
              <tr>
                <th className="p-3.5">Title &amp; Key</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Provenance</th>
                <th className="p-3.5">Price Mode</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5 text-right">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vaultEntries.slice(0, 50).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3.5 max-w-sm">
                    <div className="font-semibold text-white leading-snug">{entry.title}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{entry.id}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {entry.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-400 font-mono">{entry.provenance}</td>
                  <td className="p-3.5 font-mono text-cyan-400">{entry.priceMode}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <Link
                      href={entry.destinationUrl}
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Visit →
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
