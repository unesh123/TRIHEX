import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Cpu, ShieldCheck } from "lucide-react";
import { getSkillBySlug } from "@/lib/skills/store";
import { SkillViewer } from "@/components/skills/skill-viewer";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    return {
      title: "Skill Not Found · TRIHEX DIGITAL",
    };
  }

  return {
    title: `${skill.name} · Agent Skills Library`,
    description: skill.summary,
    openGraph: {
      title: `${skill.name} · Agent Skills Library`,
      description: skill.summary,
      url: `https://trihexdigital.shop/skills/${skill.slug}`,
      siteName: "TRIHEX DIGITAL",
    },
    alternates: {
      canonical: `https://trihexdigital.shop/skills/${skill.slug}`,
    },
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/skills"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Agent Skills
          </Link>
        </div>

        {/* Skill Title Banner */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-blue-950/30 via-slate-900/50 to-slate-950 p-6 sm:p-8 mb-8 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
              {skill.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
              {skill.files.length} Multi-file Components
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            {skill.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mb-4">
            {skill.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-4 border-t border-white/5">
            <div>Author: <strong className="text-slate-200">{skill.author}</strong></div>
            <span>•</span>
            <div>License: <strong className="text-slate-200">{skill.license}</strong></div>
            <span>•</span>
            <div>Version: <strong className="text-slate-200">{skill.version}</strong></div>
          </div>
        </div>

        {/* Interactive Multi-file Code Explorer */}
        <SkillViewer skill={skill} />
      </div>
    </main>
  );
}
