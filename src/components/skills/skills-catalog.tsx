"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  Filter, 
  Layers, 
  Sparkles,
  Terminal,
  Code2,
  Server,
  Lock,
  Workflow,
  Database,
  GraduationCap
} from "lucide-react";
import { AgentSkill, SkillCategory } from "@/lib/skills/types";

interface SkillsCatalogProps {
  initialSkills: AgentSkill[];
}

const CATEGORY_META: Record<
  string, 
  { label: string; icon: any; color: string }
> = {
  ALL: { label: "All Skills", icon: Layers, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  CODING: { label: "Coding & Fullstack", icon: Code2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  AI_ENGINEERING: { label: "AI Engineering & LLMs", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  DEVOPS: { label: "DevOps & Cloud Infra", icon: Server, color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  SECURITY: { label: "Cybersecurity & Blue Team", icon: Lock, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  AUTOMATION: { label: "Browser & OS Automation", icon: Workflow, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  DATA: { label: "Data & Analytics", icon: Database, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  RESEARCH: { label: "Research & Academic", icon: GraduationCap, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
};

export function SkillsCatalog({ initialSkills }: SkillsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Filter skills by search query and category
  const filteredSkills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialSkills.filter((skill) => {
      const matchesCategory =
        selectedCategory === "ALL" || skill.category === selectedCategory;

      if (!matchesCategory) return false;
      if (!q) return true;

      return (
        skill.name.toLowerCase().includes(q) ||
        skill.summary.toLowerCase().includes(q) ||
        skill.tags.some((t) => t.toLowerCase().includes(q)) ||
        skill.category.toLowerCase().includes(q)
      );
    });
  }, [initialSkills, searchQuery, selectedCategory]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: initialSkills.length };
    for (const skill of initialSkills) {
      counts[skill.category] = (counts[skill.category] || 0) + 1;
    }
    return counts;
  }, [initialSkills]);

  return (
    <div className="space-y-6">
      {/* Search and Category Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by keyword, framework, or task..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-900/80 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Counter indicator */}
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <span>Showing:</span>
          <strong className="text-white text-sm">{filteredSkills.length}</strong>
          <span>of {initialSkills.length} skills</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {Object.entries(CATEGORY_META).map(([catKey, meta]) => {
          const Icon = meta.icon;
          const count = categoryCounts[catKey] || 0;
          const isSelected = selectedCategory === catKey;

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-900/30"
                  : "bg-slate-900/70 border-white/5 text-slate-300 hover:bg-slate-800 hover:border-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{meta.label}</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Skills Grid */}
      {filteredSkills.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-12 text-center space-y-3">
          <Cpu className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-semibold text-white">No Agent Skills Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No capabilities matched &ldquo;{searchQuery}&rdquo;. Try another search keyword or switch category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-blue-500/40 hover:bg-slate-900/95 transition-all shadow-lg hover:shadow-blue-950/20"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono uppercase tracking-wider">
                    {skill.category.replace("_", " ")}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {skill.files.length} {skill.files.length === 1 ? "file" : "files"}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-2 line-clamp-2">
                  {skill.name}
                </h3>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {skill.summary}
                </p>

                {/* Compatibility Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                  {skill.compatibility.map((runtime) => (
                    <span
                      key={runtime}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono"
                    >
                      {runtime}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3.5 border-t border-white/5 flex items-center justify-between mt-auto">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>

                <Link
                  href={`/skills/${skill.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm group-hover:translate-x-0.5"
                >
                  Inspect Skill
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
