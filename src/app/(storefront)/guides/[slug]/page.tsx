import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGuideBySlug } from "@/lib/guides/guide-registry";
import { GuideArticle } from "@/components/guides/guide-article";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guide Not Found · TRIHEX DIGITAL",
    };
  }

  return {
    title: `${guide.title} · TRIHEX Guides`,
    description: guide.summary,
    openGraph: {
      title: `${guide.title} · TRIHEX Guides`,
      description: guide.summary,
      url: `https://trihexdigital.shop/guides/${guide.slug}`,
      siteName: "TRIHEX DIGITAL",
    },
    alternates: {
      canonical: `https://trihexdigital.shop/guides/${guide.slug}`,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-20 print:bg-white print:text-black">
      <GuideArticle guide={guide} />
    </main>
  );
}
