import {
  Cpu,
  Zap,
  ShieldCheck,
  Globe,
  Database,
  Terminal,
  Layers,
  Sparkles,
  Lock,
  Headphones,
  CheckCircle2,
} from "lucide-react";

interface PDPFeatureGridProps {
  productTitle: string;
  slug: string;
  features: string[];
}

export function PDPFeatureGrid({
  productTitle,
  slug,
  features,
}: PDPFeatureGridProps) {
  // Build a rich 8-10 card grid derived from features and specialized category traits
  const defaultHighlights = [
    {
      title: "Enterprise Performance",
      desc: "High-priority server capacity with ultra-low latency compute.",
      icon: Zap,
    },
    {
      title: "Full Commercial Rights",
      desc: "Authorized for client delivery, commercial publishing, and monetization.",
      icon: ShieldCheck,
    },
    {
      title: "Nepal Direct Support",
      desc: "Fast activation, instant WhatsApp escalation, and local NPR checkout.",
      icon: Headphones,
    },
    {
      title: "Zero Setup Friction",
      desc: "Pre-verified login credentials or direct workspace invitation link.",
      icon: Lock,
    },
  ];

  // Enrich with specific product features
  const cards = [
    ...features.map((f, i) => ({
      title: f.length > 32 ? f.slice(0, 32) + "..." : f,
      desc: f,
      icon: i % 4 === 0 ? Cpu : i % 4 === 1 ? Sparkles : i % 4 === 2 ? Terminal : Layers,
    })),
    ...defaultHighlights,
  ].slice(0, 10);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_8px_24px_var(--shadow)] sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
            Technical Architecture
          </span>
          <h2 className="mt-0.5 font-[family-name:var(--font-sora)] text-xl font-bold text-[var(--text)] sm:text-2xl">
            Complete Feature Breakdown
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Verified for 2026
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={idx}
              className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100/70 text-blue-700">
                <IconComponent className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {card.title}
                </h4>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
