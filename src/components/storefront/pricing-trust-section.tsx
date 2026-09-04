import { ShieldCheck, Banknote, Users, RefreshCw, MessageSquare, CheckCircle2 } from "lucide-react";
import { getWhatsAppDisplay } from "@/lib/whatsapp";

export function PricingTrustSection() {
  const whatsappDisplay = getWhatsAppDisplay();

  const trustPillars = [
    {
      icon: Banknote,
      title: "100% Native NPR Payments",
      subtitle: "eSewa · Khalti · Bank QR",
      description:
        "No international dollar cards, foreign exchange fees, or bank endorsement limits. Pay smoothly using your everyday Nepali digital wallet or mobile banking.",
      tag: "Zero Dollar Fees",
    },
    {
      icon: Users,
      title: "Volume Team & Workspace Seats",
      subtitle: "Enterprise-grade pooling",
      description:
        "We procure authorized multi-seat licenses, team workspaces, and developer bundles. Individual creators get frontier AI capabilities at genuine wholesale rates.",
      tag: "Up to 80% Savings",
    },
    {
      icon: RefreshCw,
      title: "Genuine Replacement Warranty",
      subtitle: "Pro-active reliability",
      description:
        "Every warranty plan is backed by our full replacement guarantee. If a seat or activation encounters an issue within the warranty window, we replace it promptly.",
      tag: "100% Backed",
    },
    {
      icon: MessageSquare,
      title: "Human WhatsApp Support",
      subtitle: `${whatsappDisplay}`,
      description:
        "No cold ticket queues or automated bots. Real technical specialists verify payments, assist with workspace invites, and guide setup directly on WhatsApp.",
      tag: "Direct Chat",
    },
  ];

  return (
    <section className="relative overflow-hidden border-y border-[var(--border)] bg-gradient-to-b from-white via-[var(--page-soft)] to-white py-16 sm:py-20">
      {/* Background glowing ambient effects */}
      <div
        className="pointer-events-none absolute -left-20 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--primary)]/5 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="store-container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-soft)] px-3.5 py-1 text-xs font-bold text-[var(--primary)]">
            <ShieldCheck className="h-4 w-4" />
            <span>The TRIHEX Advantage</span>
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-sora)] text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
            Why TRIHEX Pricing & Access Is Different
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            High-tier AI and developer platforms shouldn&apos;t require difficult overseas payment workarounds. Here is how we make world-class digital tools accessible, verified, and sustainable for creators and businesses in Nepal.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/40 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--page-soft)] text-[var(--primary)] transition duration-300 group-hover:bg-[var(--primary)] group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full bg-[var(--page-soft)] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[var(--text-muted)] group-hover:bg-[var(--primary-soft)] group-hover:text-[var(--primary)]">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="mt-5 font-[family-name:var(--font-sora)] text-base font-bold text-[var(--text)]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-semibold text-[var(--primary)]">
                    {pillar.subtitle}
                  </p>

                  <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-1.5 border-t border-[var(--border)]/60 pt-3 text-[11px] font-semibold text-[var(--success)]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Verified TRIHEX Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
