import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Activity,
  Database,
  RefreshCw,
  Server,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Shield,
  Key,
} from "lucide-react";
import { SecurityRecoveryClient } from "@/components/security/security-recovery-client";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "TRIHEX Recovery & Defensive Security Center — Disaster Recovery & Integrity Verification",
  description:
    "Defensive security monitoring, disaster recovery verification, AES-256-GCM encrypted backup tests, SHA-256 integrity verification, and RTO/RPO compliance for TRIHEX DIGITAL.",
  openGraph: {
    title: "TRIHEX Recovery & Defensive Security Center",
    description:
      "Real-time defensive security telemetry, disaster recovery testing, and backup integrity verification.",
    url: "https://trihexdigital.shop/security",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/security",
  },
};

export const revalidate = 60;

export default function SecurityRecoveryPage() {
  const waSecUrl = buildWhatsAppUrl(
    "Hello TRIHEX Security Team. I am inquiring about enterprise compliance, SOC audits, or reporting a security disclosure."
  );

  return (
    <div className="relative min-h-screen bg-[#060813] text-slate-100 antialiased selection:bg-emerald-500/30">
      {/* Background radial effects */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[32rem] w-[54rem] rounded-full bg-gradient-to-tr from-emerald-600/15 via-cyan-600/15 to-blue-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {/* Top badge */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>TRIHEX RECOVERY & DEFENSIVE SECURITY CENTER</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Activity className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
            <span>DEFENSIVE TELEMETRY ACTIVE</span>
          </div>
        </div>

        {/* Hero title */}
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Defensive Security & Disaster Recovery
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-semibold bg-gradient-to-r from-emerald-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            AES-256-GCM Backups • SHA-256 Integrity Audits • Measured RTO/RPO
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Rigorous resilience and defensive engineering. We perform controlled synthetic data recovery tests, verifiable cryptographic restore operations, and continuous infrastructure auditing to guarantee zero data loss and maximum availability.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#recovery-simulator"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition duration-200 hover:scale-[1.02]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Run Live Recovery Test</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={waSecUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur-sm"
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Security Operations Desk</span>
            </a>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-emerald-400">99.98%</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified Uptime
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-cyan-400">&lt; 15 Mins</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              RTO Recovery Target
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-blue-400">&lt; 5 Mins</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              RPO Point Target
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-amber-400">AES-256-GCM</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Authenticated Crypt
            </div>
          </div>
        </div>

        {/* Client Interactive Recovery & Security Hub */}
        <div className="mt-14">
          <SecurityRecoveryClient />
        </div>
      </div>
    </div>
  );
}
