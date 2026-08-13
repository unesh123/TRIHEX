import Image from "next/image";
import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function ServicesAtlas({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`relative isolate overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface-ink)] text-white shadow-premium ${
        compact ? "" : "my-6 sm:my-10"
      }`}
    >
      <div className="absolute inset-0 opacity-80" aria-hidden="true">
        <Image
          src="/media/brand/trihex-digital-workflow-atlas.png"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1280px"
          className="object-cover object-right"
        />
      </div>
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,15,28,.98)_0%,rgba(8,15,28,.91)_35%,rgba(8,15,28,.42)_69%,rgba(8,15,28,.16)_100%)]"
        aria-hidden="true"
      />
      <div className="relative grid min-h-[340px] items-end gap-8 p-6 sm:min-h-[400px] sm:p-9 lg:grid-cols-[0.74fr_0.26fr] lg:p-12">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/90 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#a99bff]" aria-hidden="true" /> TRIHEX studio
          </span>
          <h2 className="mt-5 max-w-xl font-[family-name:var(--font-sora)] text-3xl font-semibold tracking-[-0.045em] text-balance sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08]">
            Turn your next digital workflow into an advantage.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-200 sm:text-base">
            From practical AI setup to thoughtful automation, TRIHEX services are scoped around the way your team actually works.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/business-ai-setup"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[var(--surface-ink)] transition hover:-translate-y-0.5 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-white"
            >
              Plan an AI setup <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/automation-services"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/50 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            >
              Explore automation
            </Link>
          </div>
        </div>
        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </section>
  );
}
