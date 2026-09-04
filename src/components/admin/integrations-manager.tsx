"use client";

import { useState } from "react";
import { 
  ProviderDefinition, 
  ProviderCategory, 
  ProviderHealthCheckResult 
} from "@/lib/providers/types";
import { 
  Cpu, 
  Search, 
  FileText, 
  Mic, 
  MapPin, 
  Palette, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Play, 
  Loader2, 
  ShieldCheck, 
  Lock,
  Layers
} from "lucide-react";

interface IntegrationsManagerProps {
  initialProviders: ProviderDefinition[];
}

export function IntegrationsManager({ initialProviders }: IntegrationsManagerProps) {
  const [providers, setProviders] = useState<ProviderDefinition[]>(initialProviders);
  const [activeCategory, setActiveCategory] = useState<"ALL" | ProviderCategory>("ALL");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ProviderHealthCheckResult>>({});

  const handleTestConnection = async (providerId: string) => {
    setTestingId(providerId);
    try {
      const res = await fetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json();
      if (data.result) {
        setTestResults((prev) => ({ ...prev, [providerId]: data.result }));
        setProviders((prev) =>
          prev.map((p) =>
            p.id === providerId
              ? {
                  ...p,
                  healthStatus: data.result.status,
                  lastCheckedAt: data.result.testedAt,
                  lastLatencyMs: data.result.latencyMs,
                  lastError: data.result.status === "HEALTHY" ? undefined : data.result.message,
                }
              : p
          )
        );
      }
    } catch (err: any) {
      console.error("Test failed:", err);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (providerId: string) => {
    try {
      const res = await fetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, action: "TOGGLE_ENABLED" }),
      });
      const data = await res.json();
      if (data.providers) {
        setProviders(data.providers);
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const filtered = providers.filter(
    (p) => activeCategory === "ALL" || p.category === activeCategory
  );

  const getCategoryIcon = (cat: ProviderCategory) => {
    switch (cat) {
      case "AI_REASONING":
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case "SEARCH_RESEARCH":
        return <Search className="w-4 h-4 text-blue-400" />;
      case "PAGE_EXTRACTION":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "SPEECH":
        return <Mic className="w-4 h-4 text-cyan-400" />;
      case "MAPS":
        return <MapPin className="w-4 h-4 text-amber-400" />;
      case "CREATIVE":
        return <Palette className="w-4 h-4 text-rose-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: "ALL", label: "All Integrations" },
          { id: "AI_REASONING", label: "AI & Reasoning" },
          { id: "SEARCH_RESEARCH", label: "Search & Research" },
          { id: "PAGE_EXTRACTION", label: "Extraction" },
          { id: "SPEECH", label: "Speech & Voice" },
          { id: "MAPS", label: "Maps & Geospatial" },
          { id: "CREATIVE", label: "Creative" },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveCategory(id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards Grid: 1 col on mobile (<640px), 2 cols on md, 3 cols on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((provider) => {
          const testRes = testResults[provider.id];
          const isConfigured = provider.healthStatus !== "NOT_CONFIGURED";
          const isTesting = testingId === provider.id;

          return (
            <div
              key={provider.id}
              className={`flex flex-col rounded-2xl border p-5 transition-all shadow-lg ${
                provider.enabled
                  ? "bg-slate-900/80 border-white/10 hover:border-blue-500/30"
                  : "bg-slate-950/60 border-white/5 opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    {getCategoryIcon(provider.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{provider.displayName}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">Priority: #{provider.priority}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border ${
                    provider.healthStatus === "HEALTHY"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : provider.healthStatus === "DEGRADED"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : provider.healthStatus === "NOT_CONFIGURED"
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {provider.healthStatus === "HEALTHY" && <CheckCircle2 className="w-3 h-3" />}
                  {provider.healthStatus === "DEGRADED" && <AlertTriangle className="w-3 h-3" />}
                  {provider.healthStatus === "NOT_CONFIGURED" && <HelpCircle className="w-3 h-3" />}
                  {provider.healthStatus === "ERROR" && <XCircle className="w-3 h-3" />}
                  {provider.healthStatus}
                </span>
              </div>

              <p className="text-xs text-slate-300 mb-4 flex-1">{provider.notes}</p>

              {/* Capabilities */}
              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                {provider.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-300 border border-white/5"
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* Env Config Names (Zero Secrets Shown) */}
              <div className="rounded-xl bg-slate-950/70 border border-white/5 p-2.5 mb-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Required Environment Variables:
                </span>
                <div className="flex flex-wrap gap-1">
                  {provider.requiredEnvNames.map((envName) => (
                    <code
                      key={envName}
                      className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono text-[10px]"
                    >
                      {envName}
                    </code>
                  ))}
                </div>
              </div>

              {/* Latency & Test Feedback */}
              {provider.lastLatencyMs !== undefined && provider.lastLatencyMs > 0 && (
                <div className="text-[11px] text-slate-400 font-mono mb-3 flex items-center justify-between">
                  <span>Latency:</span>
                  <span className="text-emerald-400 font-bold">{provider.lastLatencyMs}ms</span>
                </div>
              )}

              {testRes && (
                <div
                  className={`text-[11px] p-2 rounded-lg mb-3 font-mono ${
                    testRes.status === "HEALTHY"
                      ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20"
                      : "bg-amber-950/40 text-amber-300 border border-amber-500/20"
                  }`}
                >
                  {testRes.message}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(provider.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    provider.enabled
                      ? "bg-white/10 hover:bg-white/15 text-slate-200"
                      : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                  }`}
                >
                  {provider.enabled ? "Disable" : "Enable"}
                </button>

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={() => handleTestConnection(provider.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Test Connection
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
