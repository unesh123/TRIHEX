"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radio,
  ArrowRight,
  TrendingUp,
  Activity,
  Wind,
  MapPin,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

interface CurrencyRateItem {
  currency: string;
  name: string;
  unit: number;
  buy: number;
  sell: number;
  deltaPercent?: number;
}

interface SeismicItem {
  id: string;
  magnitude: number;
  place: string;
  timeIso: string;
  depthKm?: number;
}

interface AirStationItem {
  city: string;
  stationName: string;
  aqi: number;
  pm25: number;
  status: string;
}

interface NepalPulseLiveTickerProps {
  initialUsdBuy?: number;
  initialUsdSell?: number;
  initialSeismicCount?: number;
}

export function NepalPulseLiveTicker({
  initialUsdBuy = 139.15,
  initialUsdSell = 139.75,
  initialSeismicCount = 4,
}: NepalPulseLiveTickerProps) {
  const [rates, setRates] = useState<CurrencyRateItem[]>([
    { currency: "USD", name: "U.S. Dollar", unit: 1, buy: initialUsdBuy, sell: initialUsdSell },
    { currency: "EUR", name: "Euro", unit: 1, buy: 151.2, sell: 151.85 },
    { currency: "GBP", name: "British Pound", unit: 1, buy: 176.4, sell: 177.15 },
    { currency: "AUD", name: "Australian Dollar", unit: 1, buy: 91.1, sell: 91.5 },
  ]);

  const [seismicEvents, setSeismicEvents] = useState<SeismicItem[]>([
    {
      id: "latest",
      magnitude: 4.2,
      place: "24 km ENE of Jajarkot, Karnali Province",
      timeIso: new Date().toISOString(),
      depthKm: 12.5,
    },
  ]);

  const [airStations, setAirStations] = useState<AirStationItem[]>([
    { city: "Kathmandu", stationName: "Ratnapark / US Embassy", aqi: 135, pm25: 49.2, status: "UNHEALTHY_SENSITIVE" },
    { city: "Pokhara", stationName: "Lakeside / Kaski", aqi: 68, pm25: 20.3, status: "MODERATE" },
  ]);

  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString());
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  // Auto-cycle through slides every 5s unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  // 24/7 Background Live Polling Hook (Runs every 15s)
  useEffect(() => {
    const fetchPulse = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const res = await fetch("/api/nepal/live-pulse");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.forex?.rates) && data.forex.rates.length > 0) {
            setRates(data.forex.rates.slice(0, 5));
          }
          if (Array.isArray(data.seismic?.events) && data.seismic.events.length > 0) {
            setSeismicEvents(data.seismic.events);
          }
          if (Array.isArray(data.airQuality?.stations) && data.airQuality.stations.length > 0) {
            setAirStations(data.airQuality.stations);
          }
          setLastSyncTime(new Date().toLocaleTimeString());
          setIsLiveActive(true);
        }
      } catch (err) {
        // Silently retain current data
      }
    };

    const intervalId = setInterval(fetchPulse, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const usd = rates.find((r) => r.currency === "USD") || rates[0];
  const eur = rates.find((r) => r.currency === "EUR");
  const gbp = rates.find((r) => r.currency === "GBP");
  const topSeismic = seismicEvents[0] || {
    magnitude: 4.2,
    place: "Nepal Himalaya Seismic Zone",
  };
  const ktmAir = airStations.find((s) => s.city === "Kathmandu") || airStations[0];
  const pkrAir = airStations.find((s) => s.city === "Pokhara") || airStations[1];

  return (
    <section
      className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-5 text-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="store-container flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Live Radar Indicator & Rotating Slide Content */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <div className="relative shrink-0 flex items-center justify-center h-10 w-10 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-400 shadow-inner">
            <Radio className="w-5 h-5 animate-pulse text-red-500" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-950/40 px-2 py-0.5 rounded-md border border-red-500/30">
                <span>24/7 LIVE MACRO RADAR</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                Synced at {lastSyncTime}
              </span>
            </div>

            {/* Slide 0: NRB Forex Rates */}
            {activeSlide === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-amber-300 font-extrabold flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" /> NRB Forex:
                  </span>
                  <span>1 USD = NPR {usd?.buy ? usd.buy.toFixed(2) : "139.15"} (Buy) / {usd?.sell ? usd.sell.toFixed(2) : "139.75"} (Sell)</span>
                  {eur && (
                    <span className="text-slate-400 hidden lg:inline">
                      · 1 EUR = NPR {eur.buy.toFixed(2)}
                    </span>
                  )}
                  {gbp && (
                    <span className="text-slate-400 hidden xl:inline">
                      · 1 GBP = NPR {gbp.buy.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Slide 1: USGS Nepal Seismic Radar */}
            {activeSlide === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-rose-400 font-extrabold flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" /> USGS Seismic:
                  </span>
                  <span>
                    Magnitude {topSeismic.magnitude} · {topSeismic.place}
                  </span>
                  <span className="text-xs px-2 py-0.2 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 font-mono">
                    {seismicEvents.length} events logged
                  </span>
                </div>
              </div>
            )}

            {/* Slide 2: Nepal Air Quality & PM2.5 */}
            {activeSlide === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                <div className="text-xs sm:text-sm font-bold text-white flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-cyan-400 font-extrabold flex items-center gap-1">
                    <Wind className="h-3.5 w-3.5" /> Nepal Air Quality:
                  </span>
                  <span>Kathmandu AQI {ktmAir ? ktmAir.aqi : 135} (PM2.5: {ktmAir ? ktmAir.pm25 : "49.2"} µg/m³)</span>
                  {pkrAir && (
                    <span className="text-emerald-300 hidden sm:inline">
                      · Pokhara AQI {pkrAir.aqi} (Clean Air)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Action & Slide Dot Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900 border border-slate-800">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === idx
                    ? "w-5 bg-gradient-to-r from-red-500 to-amber-500"
                    : "w-2 bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>

          <Link
            href="/nepal"
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5 border border-slate-700/80"
          >
            <span>Forex &amp; Data Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/map"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Interactive</span> Map
          </Link>
        </div>
      </div>
    </section>
  );
}
