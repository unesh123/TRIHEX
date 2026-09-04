import { Clock, ShieldCheck, CheckCircle2, MessageSquare, CreditCard, Key } from "lucide-react";

interface PDPFulfillmentTimelineProps {
  activationLabel: string;
  deliveryEstimate: string;
  warrantyLabel?: string;
}

export function PDPFulfillmentTimeline({
  activationLabel,
  deliveryEstimate,
  warrantyLabel,
}: PDPFulfillmentTimelineProps) {
  const steps = [
    {
      num: "01",
      title: "Place Order in NPR",
      desc: "Checkout with eSewa, Khalti, or mobile banking QR. No international card required.",
      icon: CreditCard,
    },
    {
      num: "02",
      title: "Payment Verification",
      desc: "Upload proof receipt. Operations team confirms within 5–15 minutes during active hours.",
      icon: Clock,
    },
    {
      num: "03",
      title: "Secure Handover",
      desc: `${activationLabel} · Delivery target: ${deliveryEstimate}.`,
      icon: Key,
    },
    {
      num: "04",
      title: "Ongoing Warranty Support",
      desc: `${warrantyLabel ?? "Active warranty protection"} · Instant WhatsApp replacement guarantee.`,
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_8px_24px_var(--shadow)] sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
            Fulfillment SLA
          </span>
          <h2 className="mt-0.5 font-[family-name:var(--font-sora)] text-xl font-bold text-[var(--text)] sm:text-2xl">
            Order-to-Delivery Process
          </h2>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          Average Turnaround: {deliveryEstimate}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => {
          const IconComp = step.icon;
          return (
            <div
              key={step.num}
              className="relative flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/20"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400">
                    STEP {step.num}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <IconComp className="h-3.5 w-3.5" />
                  </div>
                </div>
                <h4 className="mt-2.5 text-xs font-bold text-slate-900 leading-snug">
                  {step.title}
                </h4>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
