import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { Button } from "@/components/ui/button";
import {
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
} from "@/components/seo/json-ld";
import {
  getAllBlogPosts,
  getBlogPost,
} from "@/lib/seo/blog-posts";
import { getSiteUrl } from "@/lib/site";
import { buildWhatsAppUrl, getWhatsAppDisplay } from "@/lib/whatsapp";

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
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      siteName: "TRIHEX DIGITAL",
      locale: "en_NP",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const waUrl = buildWhatsAppUrl(
    `Hello TRIHEX DIGITAL. I read your guide "${post.title}" and want to order / check availability.`,
  );

  return (
    <StorefrontPageShell title={post.title} description={post.description}>
      <JsonLd
        data={[
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
        ]}
      />

      <div className="mb-6 flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
        <span>{post.category}</span>
        <span>·</span>
        <time dateTime={post.publishedAt}>
          Updated {new Date(post.updatedAt).toLocaleDateString("en-NP")}
        </time>
        <span>·</span>
        <span>{post.readMinutes} min read</span>
      </div>

      <article className="mx-auto max-w-3xl space-y-8">
        {post.sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            {section.heading ? (
              <h2 className="font-[family-name:var(--font-sora)] text-xl font-semibold text-[var(--text)]">
                {section.heading}
              </h2>
            ) : null}
            {section.paragraphs.map((p) => (
              <p
                key={p.slice(0, 48)}
                className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base"
              >
                {p}
              </p>
            ))}
          </section>
        ))}

        <div className="rounded-2xl border border-[#25D366]/35 bg-[#25D366]/10 p-5">
          <p className="text-sm font-semibold text-[var(--text)]">
            Ready to order in Nepal?
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Shop on the website, pay in NPR, upload proof, then message WhatsApp{" "}
            {getWhatsAppDisplay()} for verification.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/products">Shop products</Button>
            <Button href={waUrl} external variant="whatsapp">
              WhatsApp support
            </Button>
          </div>
        </div>

        {post.relatedHrefs?.length ? (
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)]">
              Related pages
            </h2>
            <ul className="mt-2 space-y-1 text-sm">
              {post.relatedHrefs.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="text-[var(--primary)] hover:underline"
                  >
                    {r.label}
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
          ← All guides
        </Link>
      </article>
    </StorefrontPageShell>
  );
}
