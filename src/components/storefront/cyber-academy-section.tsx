import Link from "next/link";
import {
  GraduationCap,
  ShieldCheck,
  Terminal,
  BookOpen,
  ArrowRight,
  Code2,
  Award,
  Lock,
} from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function CyberAcademySection() {
  const waUrl = buildWhatsAppUrl(
    "Hello TRIHEX Academy Team. I want to inquire about the Cybersecurity & Ethical Hacking Program."
  );

  return (
    <section className="py-16 sm:py-24 bg-[#050711] text-white border-b border-cyan-500/20 relative overflow-hidden">
      {/* Cyan Glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-cyan-500/10 blur-[130px]"
        aria-hidden="true"
      />

      <div className="store-container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300 shadow-sm shadow-cyan-500/10">
            <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
            <span>TRIHEX CYBERSECURITY ACADEMY</span>
          </div>

          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl font-[family-name:var(--font-sora)]">
            Ethical Hacking, Web Defense &amp; Isolated Labs
          </h2>

          <p className="mt-3 text-sm text-slate-300 sm:text-base leading-relaxed">
            From Linux fundamentals and network packet inspection to OWASP Top 10 web defense, API auditing, and DevSecOps. Learn defensive engineering inside safe, isolated educational sandbox environments.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition"
            >
              <Terminal className="h-4 w-4" />
              <span>Explore 12 Academy Tracks</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <GraduationCap className="h-4 w-4 text-cyan-400" />
              <span>Apply for Student Seat</span>
            </a>
          </div>
        </div>

        {/* 3 Pillars of Academy */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 backdrop-blur-md space-y-3 hover:border-cyan-400/40 transition">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">12 Structured Tracks</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Curricula spanning Linux, Wireshark, Python, PTES pentesting, OWASP Top 10, Cloud security, Digital Forensics, and DevSecOps.
            </p>
            <div className="pt-2">
              <Link href="/academy" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>View Full Syllabus</span> <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 backdrop-blur-md space-y-3 hover:border-cyan-400/40 transition">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Isolated Educational Labs</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Interactive safe environments to test SQL injection defense, parameterized queries, and service vulnerability scanning without touching production systems.
            </p>
            <div className="pt-2">
              <Link href="/academy" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>Launch Interactive Lab</span> <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 p-6 backdrop-blur-md space-y-3 hover:border-cyan-400/40 transition">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Verifiable Certifications</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Demonstrate defensive security competence with cryptographically signed certificates containing SHA-256 tamper verification hashes.
            </p>
            <div className="pt-2">
              <Link href="/academy" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                <span>Take Knowledge Quiz</span> <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
