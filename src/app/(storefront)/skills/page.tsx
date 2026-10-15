import { Metadata } from "next";
import { getAllSkills } from "@/lib/skills/store";
import { SkillsCatalog } from "@/components/skills/skills-catalog";
import { Cpu, ShieldCheck, Sparkles, Terminal } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Agent Skills Library · 130+ Multi-File Agent Capabilities",
  description:
    "Curated multi-file skills for AI coding agents: Supabase Fullstack, Next.js 16 Performance, Defensive Security, and Academic Research. Sandboxed, inert code.",
  openGraph: {
    title: "TRIHEX Agent Skills Library",
    description: "Curated multi-file skills for AI coding agents in Nepal.",
    url: "https://trihexdigital.shop/skills",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/skills",
  },
};

export default function SkillsPage() {
  const skills = getAllSkills();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-slate-950 p-6 md:p-10 mb-8 backdrop-blur-xl">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Cpu className="w-3.5 h-3.5" />
              TRIHEX Agent Skills Repository
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Modular Multi-File Skills for AI Agents
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Standardized skill packages complete with instructions (<code className="text-blue-300">SKILL.md</code>), reference architectural patterns, and validation scripts for autonomous coding agents.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> Sandboxed & Inert Code Presentation · 100% Verified Safe
            </span>
            <div className="flex items-center gap-4 font-mono text-slate-400">
              <span>
                Active skills: <strong className="text-white">{skills.length}</strong>
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                Runtimes: <strong className="text-blue-400">Antigravity · Claude · Cursor · Windsurf</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Skills Catalog */}
        <SkillsCatalog initialSkills={skills} />
      </div>
    </main>
  );
}
