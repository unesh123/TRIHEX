import { Target, Users, Code, Video, Briefcase, GraduationCap } from "lucide-react";

interface PDPTargetAudienceProps {
  categorySlug: string;
  productTitle: string;
}

export function PDPTargetAudience({
  categorySlug,
  productTitle,
}: PDPTargetAudienceProps) {
  const getAudienceList = () => {
    switch (categorySlug) {
      case "developer":
      case "ai-coding":
        return [
          {
            title: "Full-Stack Software Engineers",
            desc: "Accelerate feature delivery, refactor legacy codebases, and write terminal scripts 10x faster.",
            icon: Code,
          },
          {
            title: "Tech Agency Leads & Founders",
            desc: "Deliver custom client MVPs in days instead of weeks while reducing engineering headcount costs.",
            icon: Briefcase,
          },
          {
            title: "CS Students & Bootcamp Learners",
            desc: "Learn modern frameworks with an expert AI pair programmer explaining every line in real time.",
            icon: GraduationCap,
          },
        ];
      case "video-ai":
      case "design":
      case "voice-ai":
        return [
          {
            title: "YouTubers & Short-Form Creators",
            desc: "Produce viral TikTok, Reels, and YouTube content with ultra-realistic AI voiceovers and visuals.",
            icon: Video,
          },
          {
            title: "Digital Marketing Agencies",
            desc: "Generate high-converting video ad creatives for clients without expensive production crews.",
            icon: Briefcase,
          },
          {
            title: "Faceless Brand Operators",
            desc: "Scale automated content channels across global audiences with multilingual voice dubbing.",
            icon: Users,
          },
        ];
      case "digital-assets":
      case "learning":
        return [
          {
            title: "Solopreneurs & Digital Product Creators",
            desc: "Acquire plug-and-play sales assets, covert marketing playbooks, and automated sales funnels.",
            icon: Target,
          },
          {
            title: "High-Ticket Sales Closers & B2B Reps",
            desc: "Master psychological objection handling scripts to command higher commissions and win clients.",
            icon: Briefcase,
          },
          {
            title: "Nepali Freelancers & Remote Workers",
            desc: "Build independent dollar-generating revenue streams using proven global frameworks.",
            icon: Users,
          },
        ];
      default:
        return [
          {
            title: "Power Users & Early Adopters",
            desc: "Gain first-mover advantage with state-of-the-art AI models and deep reasoning compute.",
            icon: Target,
          },
          {
            title: "Productivity Enthusiasts",
            desc: "Automate daily research, synthesis, and administrative workflows in seconds.",
            icon: Briefcase,
          },
          {
            title: "Nepali Professionals & Teams",
            desc: "Unlock premium global software without foreign credit card restrictions or payment hassles.",
            icon: Users,
          },
        ];
    }
  };

  const audiences = getAudienceList();

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-[0_8px_24px_var(--shadow)] sm:p-8">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
          <Target className="h-4 w-4" />
        </span>
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600">
            Stack Fit
          </span>
          <h2 className="font-[family-name:var(--font-sora)] text-lg font-bold text-[var(--text)] sm:text-xl">
            Who is {productTitle} Built For?
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {audiences.map((aud, i) => {
          const IconComp = aud.icon;
          return (
            <div
              key={i}
              className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-indigo-200 hover:bg-white"
            >
              <div className="flex items-center gap-2 text-indigo-700">
                <IconComp className="h-4 w-4" />
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {aud.title}
                </h4>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                {aud.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
