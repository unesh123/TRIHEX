import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, User, Tag, ShieldCheck } from "lucide-react";
import { getPromptBySlug, getAllPrompts } from "@/lib/prompts/store";
import { PromptPlayground } from "@/components/prompts/prompt-playground";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);

  if (!prompt) {
    return {
      title: "Prompt Not Found · TRIHEX DIGITAL",
    };
  }

  return {
    title: `${prompt.title} · TRIHEX Prompt Playground`,
    description: prompt.description,
    openGraph: {
      title: `${prompt.title} · TRIHEX Prompt Playground`,
      description: prompt.description,
      url: `https://trihexdigital.shop/prompts/${prompt.slug}`,
      siteName: "TRIHEX DIGITAL",
    },
    alternates: {
      canonical: `https://trihexdigital.shop/prompts/${prompt.slug}`,
    },
  };
}

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = getPromptBySlug(slug);

  if (!prompt) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/prompts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Prompt Library
          </Link>
        </div>

        {/* Prompt Header */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950/30 via-slate-900/50 to-slate-950 p-6 sm:p-8 mb-8 backdrop-blur-xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {prompt.isOriginalTrihex ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                TRIHEX Original
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
                prompts.chat Archive
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {prompt.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            {prompt.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl mb-6">
            {prompt.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Author: <strong className="text-slate-200">{prompt.author}</strong></span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>License: <strong className="text-slate-200">{prompt.license}</strong></span>
            </div>
          </div>
        </div>

        {/* Interactive Variable Playground & Code Preview */}
        <PromptPlayground prompt={prompt} />
      </div>
    </main>
  );
}
