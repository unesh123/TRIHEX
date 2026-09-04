import { Metadata } from "next";
import { getAllPrompts } from "@/lib/prompts/store";
import { PromptLibraryHub } from "@/components/prompts/prompt-library-hub";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "TRIHEX Prompt Intelligence Hub · Production AI Prompts & Playground",
  description:
    "Curated production prompts for C#, Laravel 11, Next.js 16, UGC Video Ads, Midjourney Infographics, and PhD Research. Interactive variable customization and instant copy.",
  openGraph: {
    title: "TRIHEX Prompt Intelligence Hub",
    description: "Curated AI prompts with interactive variable playground for developers & creators in Nepal.",
    url: "https://trihexdigital.shop/prompts",
    siteName: "TRIHEX DIGITAL",
  },
  alternates: {
    canonical: "https://trihexdigital.shop/prompts",
  },
};

export default function PromptsPage() {
  const prompts = getAllPrompts();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <PromptLibraryHub initialPrompts={prompts} />
    </main>
  );
}
