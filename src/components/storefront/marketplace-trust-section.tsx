import { 
  ShieldCheck, 
  CreditCard, 
  Headphones, 
  CheckCircle2, 
  RotateCw, 
  Clock, 
  FileCheck,
  Zap,
  Lock
} from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Manually Verified Deals",
    description: "Every product, student perk, and cloud credit is personally audited and tested before appearing on our marketplace.",
  },
  {
    icon: CreditCard,
    title: "Seamless Nepal Payments",
    description: "Pay in local NPR via eSewa, Khalti, or Mobile Banking QR. No USD cards or foreign currency restrictions required.",
  },
  {
    icon: Zap,
    title: "Instant WhatsApp Delivery",
    description: "Activation credentials, license keys, and direct setup instructions dispatched directly to your WhatsApp.",
  },
  {
    icon: FileCheck,
    title: "Strict Payment Slip QA",
    description: "Every transaction is matched against official bank statements within 15–45 minutes by operations staff.",
  },
  {
    icon: RotateCw,
    title: "Full Term Warranty",
    description: "If an account experiences access issues within the warranty window, we resolve or replace it free of charge.",
  },
  {
    icon: Clock,
    title: "Continuously Updated",
    description: "Our autonomous Deal Radar scans vendor promotions daily to deliver the best software bargains in Nepal.",
  },
];

export function MarketplaceTrustSection() {
  return (
    <section className="py-14 sm:py-20 bg-slate-50 border-b border-border">
      <div className="store-container">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Built For Trust &amp; Peace of Mind</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            Why Creators &amp; Developers Choose TRIHEX
          </h2>

          <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
            Digital subscriptions have reliability issues when bought from unverified channels. We provide full operational transparency and dedicated local support.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST_PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {pillar.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
