import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Activity,
  Database,
  RefreshCw,
  Server,
  ArrowRight,
  Shield,
  Key,
} from "lucide-react";

export function DefensiveSecuritySection() {
  return (
    <section className="py-14 sm:py-20 bg-[#070d18] text-white border-b border-emerald-500/20 relative overflow-hidden">
      {/* Emerald Subtle Radial Glow */}
      <div
        className="pointer-events-none absolute top-1/2 right-1/4 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-emerald-500/10 blur-[130px]"
        aria-hidden="true"
      />

      <div className="store-container relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column: Copy & Value Proposition */}
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>DEFENSIVE SECURITY &amp; DISASTER RECOVERY</span>
            </div>

            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl font-[family-name:var(--font-sora)]">
              Enterprise Resilience &amp; Verifiable Restoration
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Every critical order record, transaction ledger, and account entitlement is protected with authenticated AES-256-GCM encryption at rest, automated SHA-256 checksum audits, and measurable RTO/RPO recovery benchmarks.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <Link
                href="/security"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                <Activity className="h-4 w-4" />
                <span>Open Security &amp; Recovery Center</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/security#recovery-simulator"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                <span>Run Synthetic Recovery Test</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Telemetry Specs Grid */}
          <div className="grid grid-cols-2 gap-3 w-full lg:max-w-md">
            <div className="rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-4 text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">99.98%</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Verified Uptime
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-4 text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">&lt; 15 Mins</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                RTO SLA Target
              </div>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-slate-900/60 p-4 text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">&lt; 5 Mins</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                RPO Point Target
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-slate-900/60 p-4 text-center backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">AES-256-GCM</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Encrypted Backups
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
