"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Activity, 
  Database, 
  ArrowRightLeft, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Calculator, 
  ShieldCheck, 
  Map, 
  FileText,
  Radio
} from "lucide-react";
import { ForexSnapshot, CurrencyRate, convertForeignToNpr, convertNprToForeign } from "@/lib/nepal/nrb-forex-adapter";
import { SeismicEvent } from "@/lib/nepal/earthquake-adapter";
import { OpenDataset } from "@/lib/nepal/open-data-adapter";

interface NepalPulseHubProps {
  forex: ForexSnapshot;
  seismic: {
    events: SeismicEvent[];
    source: string;
    isLive: boolean;
  };
  datasets: OpenDataset[];
}

export function NepalPulseHub({ forex, seismic, datasets }: NepalPulseHubProps) {
  const [activeTab, setActiveTab] = useState<"FOREX" | "SEISMIC" | "DATASETS">("FOREX");

  // Currency Calculator State
  const [calcCurrency, setCalcCurrency] = useState<string>("USD");
  const [calcForeignAmount, setCalcForeignAmount] = useState<string>("100");
  const [calcNprAmount, setCalcNprAmount] = useState<string>("");
  const [calcDirection, setCalcDirection] = useState<"FOREIGN_TO_NPR" | "NPR_TO_FOREIGN">("FOREIGN_TO_NPR");

  const selectedRate = forex.rates.find((r) => r.currency === calcCurrency) || forex.rates[0];

  // Recalculate converted value
  const convertedValue = (() => {
    if (calcDirection === "FOREIGN_TO_NPR") {
      const amt = Number.parseFloat(calcForeignAmount) || 0;
      return convertForeignToNpr(amt, selectedRate.buy, selectedRate.unit);
    } else {
      const amt = Number.parseFloat(calcNprAmount) || 0;
      return convertNprToForeign(amt, selectedRate.sell, selectedRate.unit);
    }
  })();

  const formatNepalTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("en-US", {
        timeZone: "Asia/Kathmandu",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-red-950/30 via-slate-900/60 to-slate-950 p-6 md:p-10 mb-8 backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
              <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
              TRIHEX Nepal Pulse · Real-Time Civic Feeds
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              Nepal Economic & Geodetic Data Hub
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Live official foreign exchange rates from Nepal Rastra Bank, real-time seismic monitor via USGS Nepal FDSN, and curated open civic datasets.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Link
              href="/map"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
            >
              <Map className="w-4 h-4" />
              Open Interactive Nepal Map
            </Link>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" /> {forex.source}
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <Activity className="w-4 h-4" /> {seismic.source}
            </span>
          </div>
          <div className="font-mono text-slate-400">
            Rates date: <span className="text-white font-semibold">{forex.date}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("FOREX")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "FOREX"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          NRB Forex & NPR Calculator
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("SEISMIC")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "SEISMIC"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Activity className="w-4 h-4" />
          USGS Seismic Monitor ({seismic.events.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("DATASETS")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === "DATASETS"
              ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Database className="w-4 h-4" />
          Open Data Nepal ({datasets.length})
        </button>
      </div>

      {/* Tab 1: Forex & Calculator */}
      {activeTab === "FOREX" && (
        <div className="space-y-8">
          {/* Interactive Calculator Box */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-4 h-4 text-red-400" />
              <h2 className="text-base font-bold text-white">
                Live Official Currency Converter (NPR)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Currency Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Target Currency</label>
                <select
                  value={calcCurrency}
                  onChange={(e) => setCalcCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 font-medium"
                >
                  {forex.rates.map((r) => (
                    <option key={r.currency} value={r.currency}>
                      {r.currency} - {r.name} ({r.unit > 1 ? `Unit ${r.unit}` : "Unit 1"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    {calcDirection === "FOREIGN_TO_NPR"
                      ? `Amount in ${selectedRate.currency}`
                      : "Amount in NPR"}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCalcDirection(
                        calcDirection === "FOREIGN_TO_NPR" ? "NPR_TO_FOREIGN" : "FOREIGN_TO_NPR"
                      )
                    }
                    className="inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-medium"
                  >
                    <ArrowRightLeft className="w-3 h-3" /> Flip
                  </button>
                </div>

                <input
                  type="number"
                  min="1"
                  step="any"
                  value={calcDirection === "FOREIGN_TO_NPR" ? calcForeignAmount : calcNprAmount}
                  onChange={(e) => {
                    if (calcDirection === "FOREIGN_TO_NPR") {
                      setCalcForeignAmount(e.target.value);
                    } else {
                      setCalcNprAmount(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  placeholder="Enter amount..."
                />
              </div>

              {/* Result Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-red-500/20 text-center sm:text-left">
                <div className="text-[11px] font-medium text-slate-400">
                  {calcDirection === "FOREIGN_TO_NPR" ? "Converted Amount (NPR Buy)" : `Converted Amount (${selectedRate.currency} Sell)`}
                </div>
                <div className="text-2xl font-bold text-white font-mono mt-0.5">
                  {calcDirection === "FOREIGN_TO_NPR"
                    ? `NPR ${convertedValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : `${selectedRate.currency} ${convertedValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Rate: 1 {selectedRate.currency} = NPR {(selectedRate.buy / selectedRate.unit).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Rates Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/70 shadow-xl">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5">Currency</th>
                  <th className="px-4 sm:px-6 py-3.5">Unit</th>
                  <th className="px-4 sm:px-6 py-3.5">Buy (NPR)</th>
                  <th className="px-4 sm:px-6 py-3.5">Sell (NPR)</th>
                  <th className="px-4 sm:px-6 py-3.5">Spread</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs sm:text-sm">
                {forex.rates.map((rate) => (
                  <tr key={rate.currency} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 sm:px-6 py-3.5 font-sans font-medium text-white flex items-center gap-2">
                      <span className="w-8 px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono font-bold text-blue-300 text-center">
                        {rate.currency}
                      </span>
                      <span>{rate.name}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-slate-300">{rate.unit}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-emerald-400 font-semibold">
                      {rate.buy.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-slate-200">
                      {rate.sell.toFixed(2)}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-slate-400 text-xs">
                      {rate.spreadNpr.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: USGS Seismic Events */}
      {activeTab === "SEISMIC" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>Monitoring geographic rectangle: 26°N–31°N, 80°E–89°E (Nepal Region)</span>
            </div>
            <Link
              href="/map"
              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              View on Map <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seismic.events.map((event) => {
              const magColor =
                event.magnitude >= 4.5
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : event.magnitude >= 3.5
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

              return (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-red-500/40 hover:bg-slate-900/90 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border font-mono ${magColor}`}
                    >
                      M {event.magnitude}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      {formatNepalTime(event.timeIso)}
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white mt-2 leading-snug">
                    {event.place}
                  </h3>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div>Depth: {event.depthKm} km</div>
                    <div>
                      {event.latitude.toFixed(2)}°N, {event.longitude.toFixed(2)}°E
                    </div>
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      USGS <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Open Datasets */}
      {activeTab === "DATASETS" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {datasets.map((ds) => (
              <div
                key={ds.id}
                className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/70 p-5 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
                    {ds.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {ds.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono font-semibold"
                      >
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1 leading-snug">
                  {ds.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4 flex-1">
                  {ds.description}
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="text-[11px] truncate max-w-[200px]">
                    Source: <span className="text-slate-200">{ds.organization}</span>
                  </div>

                  {ds.downloadUrl && (
                    <a
                      href={ds.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold transition"
                    >
                      Access Data <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
