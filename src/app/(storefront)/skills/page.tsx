import { Metadata } from "next";
import Link from "next/link";
import { getAllSkills } from "@/lib/skills/store";
import { Cpu, ShieldCheck, FolderTree, ArrowRight, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Agent Skills Library · Multi-File Agent Capabilities",
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
              <ShieldCheck className="w-4 h-4" /> Sandboxed & Inert Code Presentation
            </span>
            <span className="font-mono text-slate-400">
              Active skills: <strong className="text-white">{skills.length}</strong>
            </span>
          </div>
        </div>

        {/* Skills Grid - Strictly 1 column on mobile (< 640px) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-6 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                  {skill.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {skill.files.length} files
                </span>
              </div>

              <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-2">
                {skill.name}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed mb-4 flex-1">
                {skill.summary}
              </p>

              {/* Tags & Runtimes */}
              <div className="flex flex-wrap items-center gap-1.5 mb-6">
                {skill.compatibility.map((runtime) => (
                  <span
                    key={runtime}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]"
                  >
                    {runtime}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  License: {skill.license}
                </span>

                <Link
                  href={`/skills/${skill.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  Explore Skill Files
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
