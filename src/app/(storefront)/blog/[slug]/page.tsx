import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import {
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/components/seo/json-ld";
import {
  getAllBlogPosts,
  getBlogPost,
} from "@/lib/seo/blog-posts";
import { getSiteUrl } from "@/lib/site";
import { buildWhatsAppUrl, getWhatsAppDisplay } from "@/lib/whatsapp";
import { CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

export const dynamic = "force-static";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Guide not found" };
  const url = `${getSiteUrl()}/blog/${post.slug}`;
  return {
    title: `${post.title} — 3x Digital (TRIHEX)`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: `${post.title} | 3x Digital Nepal`,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      siteName: "TRIHEX DIGITAL (3x Digital)",
      locale: "en_NP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | 3x Digital`,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const waUrl = buildWhatsAppUrl(
    `Hello 3x Digital / TRIHEX. I read your guide "${post.title}" and want to order / check availability.`,
  );

  const jsonLdData: Record<string, unknown>[] = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    articleJsonLd({
      title: post.title,
      description: post.description,
      slug: post.slug,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    }),
  ];

  if (post.faqs && post.faqs.length > 0) {
    jsonLdData.push(faqJsonLd(post.faqs));
  }

  return (
    <StorefrontPageShell title={post.title} description={post.description}>
      <JsonLd data={jsonLdData} />

      <div className="mb-6 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-emerald-400 font-medium">
          {post.category}
        </span>
        <span>·</span>
        <time dateTime={post.publishedAt}>
          Updated {new Date(post.updatedAt).toLocaleDateString("en-NP")}
        </time>
        <span>·</span>
        <span>{post.readMinutes} min read</span>
      </div>

      <article className="mx-auto max-w-3xl space-y-8">
        {/* Featured Snippet / Key Takeaways Block */}
        {post.takeaways && post.takeaways.length > 0 ? (
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Key Takeaways & Quick Summary</span>
            </div>
            <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
              {post.takeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Content Sections */}
        {post.sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            {section.heading ? (
              <h2 className="font-[family-name:var(--font-sora)] text-xl font-semibold text-[var(--text)]">
                {section.heading}
              </h2>
            ) : null}
            {section.paragraphs.map((p, pIdx) => (
              <p
                key={pIdx}
                className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base"
              >
                {p}
              </p>
            ))}
          </section>
        ))}

        {/* Rich FAQ Block */}
        {post.faqs && post.faqs.length > 0 ? (
          <section className="mt-8 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center gap-2 text-[var(--text)] font-semibold text-lg">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <h2>Frequently Asked Questions (FAQ)</h2>
            </div>
            <div className="space-y-3 divide-y divide-[var(--border)]/60 pt-2">
              {post.faqs.map((faq, fIdx) => (
                <div key={fIdx} className="pt-3 first:pt-0">
                  <h3 className="text-base font-medium text-[var(--text)]">
                    {faq.question}
                  </h3>
                  <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Call to Action Box */}
        <div className="rounded-2xl border border-[#25D366]/35 bg-[#25D366]/10 p-5">
          <p className="text-sm font-semibold text-[var(--text)]">
            Ready to order in Nepal with 3x Digital?
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Shop on the website, pay in NPR via bank QR / eSewa / Khalti, upload proof, then message WhatsApp{" "}
            {getWhatsAppDisplay()} for instant verification.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/products">Shop Products</Button>
            <Button href={waUrl} external variant="whatsapp">
              WhatsApp Support
            </Button>
          </div>
        </div>

        {post.relatedHrefs?.length ? (
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">
              Related Pages & Subscriptions
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {post.relatedHrefs.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="text-[var(--primary)] hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>→</span>
                    <span>{r.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <Link
          href="/blog"
          className="inline-flex text-sm font-semibold text-[var(--primary)]"
        >
          ← All Guides & Topics
        </Link>
      </article>
    </StorefrontPageShell>
  );
}
