import type { Metadata } from "next";
import Link from "next/link";
import { StorefrontPageShell } from "@/components/storefront/page-shell";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { getAllBlogPosts } from "@/lib/seo/blog-posts";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog — AI & Digital Tools Guides for Nepal",
  description:
    "Guides for buying ChatGPT, Gemini, CapCut and digital tools in Nepal with NPR pricing, bank QR payment, and WhatsApp support.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "TRIHEX DIGITAL Blog — Nepal AI & Digital Tools",
    description:
      "Practical guides for ChatGPT, Gemini, CapCut and digital payments in Nepal.",
    url: `${getSiteUrl()}/blog`,
    type: "website",
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogPosts();

  return (
    <StorefrontPageShell
      title="Blog & guides"
      description="SEO guides for Nepal: AI tools, CapCut, ChatGPT, Gemini, and how to pay with bank QR, eSewa, or Khalti."
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />

      <ul className="grid gap-5 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <article className="h-full rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[0_8px_24px_var(--shadow)] transition hover:border-[var(--primary)]/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
                {post.category} · {post.readMinutes} min read
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-lg font-semibold text-[var(--text)]">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-[var(--primary)]"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {post.description}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-[var(--primary)]"
              >
                Read guide →
              </Link>
            </article>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-2xl text-sm text-[var(--text-muted)]">
        Looking to shop now? Browse{" "}
        <Link href="/ai-tools-nepal" className="text-[var(--primary)] hover:underline">
          AI tools for Nepal
        </Link>{" "}
        or the full{" "}
        <Link href="/products" className="text-[var(--primary)] hover:underline">
          product catalogue
        </Link>
        .
      </p>
    </StorefrontPageShell>
  );
}
