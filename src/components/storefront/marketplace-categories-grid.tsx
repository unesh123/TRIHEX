import Link from "next/link";
import { 
  Bot, 
  Code2, 
  GraduationCap, 
  Briefcase, 
  ArrowRight,
  Sparkles,
  Video,
  FileCode,
  Layers,
  Wand2
} from "lucide-react";

const CATEGORY_GROUPS = [
  {
    icon: Bot,
    title: "AI Tools",
    subtitle: "Assistants, LLMs & Generative Media",
    href: "/ai-tools-nepal",
    badge: "15+ Tools",
    items: [
      { name: "Coding AI (Cursor, Claude Code)", href: "/products/cursor-pro-12m" },
      { name: "Video AI (CapCut Pro Rs. 399)", href: "/products/capcut-pro-30-days" },
      { name: "Voice AI (ElevenLabs Creator)", href: "/products/elevenlabs-creator-shared" },
      { name: "Image AI (Canva Pro, Midjourney)", href: "/products/canva-pro-1-year" },
    ],
  },
  {
    icon: Code2,
    title: "Developer & Cloud",
    subtitle: "APIs, Compute & Infrastructure",
    href: "/deals",
    badge: "Free Perks",
    items: [
      { name: "DigitalOcean $200 Credits", href: "/deals#digitalocean-200-credits" },
      { name: "GitHub Student Developer Pack", href: "/deals#github-student-pack" },
      { name: "Claude API Prepaid Tokens", href: "/products/claude-code-api-access" },
      { name: "Production System Prompts", href: "/prompts" },
    ],
  },
  {
    icon: GraduationCap,
    title: "Education & Skills",
    subtitle: "Courses, Vault Blueprints & Ebooks",
    href: "/vault",
    badge: "Master Bundles",
    items: [
      { name: "Dropshipping Master Bundle 2026", href: "#free-vault" },
      { name: "AI Money Maker Products 2026", href: "/products/ai-money-maker-digital-course-2026" },
      { name: "Closing Psychology Frameworks", href: "/products/the-psychology-of-closing-bundle" },
      { name: "Passive Inbound Lead Generation", href: "/products/the-passive-rebel-antisocial-leads" },
    ],
  },
  {
    icon: Briefcase,
    title: "Business & Agency",
    subtitle: "Automation, WhatsApp CRM & Templates",
    href: "/automation-services",
    badge: "Enterprise",
    items: [
      { name: "Custom WhatsApp CRM Bots", href: "/inquire" },
      { name: "Autonomous n8n Pipelines", href: "/inquire" },
      { name: "Business AI Setup Consulting", href: "/business-ai-setup" },
      { name: "Corporate Software Invoicing", href: "/inquire" },
    ],
  },
];

export function MarketplaceCategoriesGrid() {
  return (
    <section className="py-14 sm:py-20 bg-white border-b border-border">
      <div className="store-container">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">
              <Layers className="h-3.5 w-3.5 text-blue-600" />
              <span>Structured Marketplace Matrix</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Browse By Category &amp; Domain
            </h2>
          </div>

          <Link
            href="/categories"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            <span>Explore all categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_GROUPS.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-blue-600 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-blue-100/70 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">
                      {cat.badge}
                    </span>
                  </div>

                  <Link href={cat.href} className="block">
                    <h3 className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors">
                      {cat.title}
                    </h3>
                  </Link>

                  <p className="mt-1 text-xs text-slate-500 mb-4">
                    {cat.subtitle}
                  </p>

                  <ul className="space-y-2 border-t border-slate-200/60 pt-3">
                    {cat.items.map((item, idx) => (
                      <li key={idx}>
                        <Link
                          href={item.href}
                          className="flex items-center justify-between text-xs text-slate-700 hover:text-blue-600 font-medium transition-colors"
                        >
                          <span className="truncate">{item.name}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  <Link
                    href={cat.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>View Section</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
