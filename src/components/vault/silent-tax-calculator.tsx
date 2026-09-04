"use client";

import { useState } from "react";
import {
  HISTORICAL_CPI_DATA,
  calculatePurchasingPower,
  CURRENT_2026_CPI,
} from "@/lib/catalog/vault-items";
import { TrendingDown, Zap, ShieldAlert, DollarSign, Clock, ArrowRight } from "lucide-react";

export function SilentTaxCalculator() {
  const [year, setYear] = useState<number>(1971);
  const [baseAmount, setBaseAmount] = useState<number>(100);

  const stats = calculatePurchasingPower(year, baseAmount);

  // Asset benchmarks
  const goldEquivalence = ((baseAmount / (year <= 1933 ? 20.67 : year <= 1971 ? 35 : 380)) * 2850).toFixed(0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-slate-100 shadow-2xl shadow-blue-950/20">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>THE SILENT TAX ARCHIVE</span>
          </div>
          <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-white">
            Historical Fiat Decay &amp; Purchasing Power Calculator
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Official US Bureau of Labor Statistics CPI-U historical dataset (1913–2026).
          </p>
        </div>

        {/* Live Index Pill */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">2026 Base Index</div>
            <div className="text-sm font-black text-white">{CURRENT_2026_CPI.toFixed(1)} CPI-U</div>
          </div>
        </div>
      </div>

      {/* Main interactive controls */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left column: Controls */}
        <div className="space-y-6 lg:col-span-6">
          {/* Amount input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Benchmark Capital Amount ($ USD)
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {[20, 50, 100, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBaseAmount(amt)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    baseAmount === amt
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                      : "border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Year slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="uppercase tracking-wider text-slate-300">Historical Year Baseline</span>
              <span className="rounded-lg bg-blue-500/20 px-2.5 py-0.5 font-mono text-sm font-black text-blue-400">
                {year}
              </span>
            </div>

            <input
              type="range"
              min={1913}
              max={2026}
              step={1}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-blue-500 focus:outline-none"
            />

            <div className="mt-2 flex justify-between font-mono text-[10px] text-slate-500">
              <span>1913 (Fed Act)</span>
              <span>1971 (Nixon Shock)</span>
              <span>2000 (Tech Boom)</span>
              <span>2026 (Present)</span>
            </div>
          </div>

          {/* Milestone presets */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Economic Inflection Points</span>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {[
                { y: 1913, label: "1913: Federal Reserve" },
                { y: 1971, label: "1971: Nixon Gold Window" },
                { y: 2008, label: "2008: Great Financial Crisis" },
                { y: 2020, label: "2020: Global Stimulus" },
              ].map((item) => (
                <button
                  key={item.y}
                  type="button"
                  onClick={() => setYear(item.y)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                    year === item.y
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-800/80 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event description callout */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Historical Context ({stats.year})</div>
            <div className="mt-0.5 text-xs font-semibold text-slate-200">{stats.event}</div>
          </div>
        </div>

        {/* Right column: Big Impact Display */}
        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-slate-900 to-slate-950 p-5">
            <div className="flex items-center justify-between text-xs font-bold text-red-400">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4" />
                Purchasing Power Destroyed
              </span>
              <span className="font-mono text-xs text-slate-400">Since {year}</span>
            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-red-400">
              −{stats.purchasingPowerLostPercent}%
            </div>
            <p className="mt-1 text-xs text-slate-400">
              A ${baseAmount} bill saved in {year} now holds just{" "}
              <span className="font-bold text-white">${(baseAmount * (stats.valueRetainedCents / 100)).toFixed(2)}</span>{" "}
              of original purchasing power.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-950 p-5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                2026 Dollar Equivalent
              </span>
              <span className="font-mono text-xs text-slate-400">{stats.multiplier}x Inflation Factor</span>
            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-emerald-400">
              ${stats.equivalentToday.toLocaleString()}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              You need <span className="font-bold text-white">${stats.equivalentToday.toLocaleString()}</span> today to buy the identical basket of goods that <span className="font-bold text-white">${baseAmount}</span> bought in {year}.
            </p>
          </div>

          {/* Hard Asset Comparison */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Zap className="h-3.5 w-3.5" />
                Hard Asset Hedge (Gold Benchmark)
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              ${baseAmount} invested in Gold in {year} would be worth approx.{" "}
              <span className="font-mono font-bold text-amber-300">${Number(goldEquivalence).toLocaleString()}</span> today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
