"use client";

import { useState, useMemo } from "react";
import { ResourceItem, ResourceCategory, ResourceRightsTag } from "@/lib/resources/types";
import { ResourceCard } from "./resource-card";
import { Search, ShieldCheck, Database, FileText, Filter } from "lucide-react";

interface ResourceHubProps {
  initialResources: ResourceItem[];
}

const CATEGORIES: Array<{ id: ResourceCategory | "ALL"; label: string }> = [
  { id: "ALL", label: "All Resources" },
  { id: "SECURITY_ADVISORY", label: "Security & CVEs" },
  { id: "DEVELOPER_CHEAT_SHEET", label: "Cheat Sheets" },
  { id: "PUBLIC_DATASET", label: "Public Datasets" },
  { id: "CIVIC_RECORD", label: "Civic Records" },
  { id: "OPEN_TOOL", label: "Open Tools" },
];

export function ResourceHub({ initialResources }: ResourceHubProps) {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "ALL">("ALL");
  const [selectedRights, setSelectedRights] = useState<ResourceRightsTag | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = useMemo(() => {
    return initialResources.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedRights !== "ALL" && item.rightsTag !== selectedRights) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.licenseName.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [initialResources, selectedCategory, selectedRights, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Filters Strip */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-white bg-slate-950/60 border border-white/5"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVEs, datasets, tools..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grid: 1 card per row on mobile (<640px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-16 rounded-3xl border border-white/10 bg-slate-900/40 text-slate-400 text-sm space-y-2">
          <Database className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-semibold text-white">No resources found</p>
          <p className="text-xs text-slate-400">Try adjusting your category or keyword filters.</p>
        </div>
      )}
    </div>
  );
}
