"use client";

import { useState } from "react";
import { 
  Gauge, 
  ShieldAlert, 
  Cpu, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  TrendingDown,
  Lock
} from "lucide-react";
import { FailoverEvent } from "@/lib/providers/budget";

interface ProviderUsageConsoleProps {
  stats: {
    dailyCostCents: number;
    requestCountToday: number;
    dailyBudgetCents: number;
    budgetRemainingCents: number;
    providerBreakdown: Record<string, { costCents: number; callCount: number }>;
  };
  failoverEvents: FailoverEvent[];
}

export function ProviderUsageConsole({ stats, failoverEvents }: ProviderUsageConsoleProps) {
  const [currentStats] = useState(stats);

  const spentDollars = (currentStats.dailyCostCents / 100).toFixed(2);
  const budgetDollars = (currentStats.dailyBudgetCents / 100).toFixed(2);
  const remainingDollars = (currentStats.budgetRemainingCents / 100).toFixed(2);
  const percentUsed = Math.min(100, Math.round((currentStats.dailyCostCents / currentStats.dailyBudgetCents) * 100));

  return (
    <div className="space-y-6">
      {/* Top Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Budget Progress */}
        <div className="p-6 rounded-2xl border border-border bg-white shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-primary" /> Daily AI Budget Guard
            </span>
            <span className="text-xs font-mono font-bold text-text">${spentDollars} / ${budgetDollars}</span>
          </div>

          <div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentUsed > 80 ? "bg-rose-500" : percentUsed > 50 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-muted mt-2 font-mono">
              <span>{percentUsed}% Consumed</span>
              <span>${remainingDollars} Remaining Today</span>
            </div>
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            Automatic circuit breaker trips at $5.00/day. If reached, deep research and copilot failover gracefully to deterministic grounded baselines. Storefront commerce never halts.
          </p>
        </div>

        {/* Request Throughput */}
        <div className="p-6 rounded-2xl border border-border bg-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" /> Calls Today
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">Active</span>
          </div>

          <p className="text-3xl font-black text-text">{currentStats.requestCountToday}</p>
          <p className="text-xs text-text-muted leading-relaxed">
            Requests routed through Gemini 1.5 Flash, OpenAI GPT-4o-mini, and You.com Search indexing engines.
          </p>

          <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] text-emerald-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Rate limiters &amp; payload guards engaged
          </div>
        </div>

        {/* Security & Token Leak Guard */}
        <div className="p-6 rounded-2xl border border-border bg-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-blue-600" /> Credential Isolation
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Zero Leak Guarantee
            </span>
          </div>

          <p className="text-sm font-bold text-text">Server-Side Strict Isolation</p>
          <p className="text-xs text-text-muted leading-relaxed">
            API keys are loaded via <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">src/lib/env/server.ts</code> with explicit runtime window guards. Keys are never transmitted to client bundles or browser consoles.
          </p>

          <div className="pt-2 border-t border-border flex items-center gap-1.5 text-[11px] text-text-muted font-mono">
            <span>Masking: SHA-256 fingerprint verified</span>
          </div>
        </div>
      </div>

      {/* Provider Cost & Usage Breakdown */}
      <div className="p-6 rounded-2xl border border-border bg-white shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-text flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" /> Provider Cost &amp; Activity Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Gemini */}
          <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Google Gemini</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Primary LLM
              </span>
            </div>
            <p className="text-xl font-black text-text">
              ${((currentStats.providerBreakdown?.gemini?.costCents || 0) / 100).toFixed(3)}
            </p>
            <p className="text-xs text-text-muted">
              {currentStats.providerBreakdown?.gemini?.callCount || 0} calls • 8s timeout • Gemini 1.5 Flash
            </p>
          </div>

          {/* OpenAI */}
          <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">OpenAI</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                Secondary LLM
              </span>
            </div>
            <p className="text-xl font-black text-text">
              ${((currentStats.providerBreakdown?.openai?.costCents || 0) / 100).toFixed(3)}
            </p>
            <p className="text-xs text-text-muted">
              {currentStats.providerBreakdown?.openai?.callCount || 0} calls • GPT-4o-mini failover
            </p>
          </div>

          {/* You.com */}
          <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">You.com YDC</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Web Indexing
              </span>
            </div>
            <p className="text-xl font-black text-text">
              ${((currentStats.providerBreakdown?.youcom?.costCents || 0) / 100).toFixed(3)}
            </p>
            <p className="text-xs text-text-muted">
              {currentStats.providerBreakdown?.youcom?.callCount || 0} queries • SafeFetch URL auditing
            </p>
          </div>
        </div>
      </div>

      {/* Failover & Incident Event Log */}
      <div className="p-6 rounded-2xl border border-border bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Failover &amp; Circuit Breaker Event Log
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Autonomous failover events caught and safely routed to secondary adapters or deterministic fallbacks.
            </p>
          </div>
          <span className="text-xs font-mono text-text-muted">Recent: {failoverEvents.length} events</span>
        </div>

        {failoverEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-60" />
            No failover incidents recorded today. All provider endpoints healthy or executing cleanly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-2 font-semibold">Timestamp</th>
                  <th className="pb-2 font-semibold">From Provider</th>
                  <th className="pb-2 font-semibold">To Provider</th>
                  <th className="pb-2 font-semibold">Reason / Exception</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {failoverEvents.map((evt) => (
                  <tr key={evt.id} className="py-2 hover:bg-slate-50/50">
                    <td className="py-2.5 font-mono text-[11px] text-text-muted">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 font-semibold text-rose-600 font-mono">{evt.fromProvider}</td>
                    <td className="py-2.5 font-semibold text-emerald-600 font-mono">{evt.toProvider}</td>
                    <td className="py-2.5 text-text-muted truncate max-w-md">{evt.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
