import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Terminal,
  BookOpen,
  Award,
  Lock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Code2,
  FileCode2,
  GraduationCap,
} from "lucide-react";
import { AcademyHubClient } from "@/components/academy/academy-hub-client";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "TRIHEX Cybersecurity Academy — Ethical Hacking, Defense & Isolated Labs",
  description:
    "Professional beginner-to-advanced cybersecurity education in Nepal: Linux hardening, OWASP Top 10 defense, API security, SIEM monitoring, interactive isolated educational labs, and verifiable certificates.",
  openGraph: {
    title: "TRIHEX Cybersecurity Academy",
    description:
      "Structured cybersecurity curricula, interactive isolated labs, practical quizzes, and completion certificates.",
    url: "https://trihexdigital.shop/academy",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/academy",
  },
};

export const revalidate = 60;

export default function AcademyPage() {
  const waEnrollUrl = buildWhatsAppUrl(
    "Hello TRIHEX Academy Team. I want to enroll in the Cybersecurity & Ethical Hacking Program (Pro / VIP Mentorship Tier). Please guide me with syllabus access and lab credentials."
  );

  return (
    <div className="relative min-h-screen bg-[#060913] text-slate-100 antialiased selection:bg-cyan-500/30">
      {/* Background radial effects */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:28px_28px] opacity-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[32rem] w-[54rem] rounded-full bg-gradient-to-tr from-cyan-600/15 via-blue-600/15 to-violet-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        {/* Top badge */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-md">
            <GraduationCap className="h-4 w-4 text-cyan-400" />
            <span>TRIHEX DEFENSIVE CYBERSECURITY ACADEMY · NEPAL</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>ISO / NIST / OWASP ALIGNED</span>
          </div>
        </div>

        {/* Hero title */}
        <div className="mt-8 text-center max-w-3xl mx-auto">
          <h1 className="font-[family-name:var(--font-sora)] text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Cybersecurity & Ethical Hacking Academy
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-semibold bg-gradient-to-r from-cyan-300 via-blue-200 to-violet-300 bg-clip-text text-transparent">
            12 Structured Learning Tracks • Interactive Isolated Labs • Verifiable Certifications
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
            Bridging the offensive and defensive engineering divide. Master real-world penetration testing methodology, OWASP Top 10 web defense, API audits, cloud infrastructure security, and incident response strictly within authorized, isolated sandbox environments.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#interactive-labs"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition duration-200 hover:scale-[1.02]"
            >
              <Terminal className="h-4 w-4" />
              <span>Launch Isolated Lab Simulation</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={waEnrollUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur-sm"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Enroll via Student Desk</span>
            </a>
          </div>
        </div>

        {/* Key Academy Metrics */}
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-cyan-400">12 Tracks</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Curated Syllabus
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-blue-400">100% Isolated</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Safe Educational Labs
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-violet-400">Hands-on</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Interactive Quizzes
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-center backdrop-blur-md">
            <div className="text-2xl font-black text-emerald-400">Cryptographic</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verifiable Certificates
            </div>
          </div>
        </div>

        {/* Main Interactive Academy Hub Component */}
        <div className="mt-14">
          <AcademyHubClient />
        </div>

        {/* Legal and Ethical Disclaimer */}
        <div className="mt-16 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-6 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 font-bold uppercase tracking-wider">
                Strict Authorization & Educational Policy:
              </strong>
              <p>
                All penetration testing and vulnerability analysis techniques taught in the TRIHEX Academy are provided strictly for educational and defensive auditing purposes. Practical laboratory exercises operate solely inside isolated local containers. Unauthorized scanning or attacking of third-party systems is strictly prohibited under the Electronic Transactions Act (Nepal) and international cyber law.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
