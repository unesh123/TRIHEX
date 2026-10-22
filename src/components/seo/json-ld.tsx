import { getSiteUrl } from "@/lib/site";
import { getWhatsAppDisplay, getWhatsAppNumber } from "@/lib/whatsapp";

export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TRIHEX DIGITAL",
    alternateName: [
      "3x Digital",
      "3X Digital",
      "3xDigital",
      "TRIHEX DIGITAL",
      "AITRIHEX",
      "TRIHEX",
    ],
    url: origin,
    logo: `${origin}/icon`,
    description:
      "Nepal's #1 digital storefront for AI and digital tools. Official 3x Digital subscriptions for Musi AI, CapCut Pro AI, ChatGPT Plus, Cursor Pro, Claude Pro, and Gemini with transparent NPR pricing, bank QR checkout, and WhatsApp support.",
    telephone: getWhatsAppDisplay(),
    knowsAbout: [
      "Musi AI subscription",
      "3x Digital Musi AI",
      "CapCut Pro AI subscription",
      "3x Digital CapCut",
      "ChatGPT Plus Nepal",
      "3x Digital ChatGPT",
      "Cursor Pro AI Nepal",
      "Claude Pro Nepal",
      "AI tools Nepal",
      "Nepal digital subscriptions",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
    },
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
    sameAs: [
      `https://wa.me/${getWhatsAppNumber()}`,
      "https://github.com/unesh123/TRIHEX",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        telephone: getWhatsAppDisplay(),
        availableLanguage: ["en", "ne"],
        areaServed: "NP",
      },
    ],
  };
}

export function websiteJsonLd() {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "TRIHEX DIGITAL (3x Digital)",
    alternateName: [
      "3x Digital",
      "3X Digital",
      "3xDigital",
      "TRIHEX DIGITAL",
      "AITRIHEX",
      "TRIHEX",
    ],
    url: origin,
    description:
      "Official 3x Digital AI & software subscription portal for Nepal. Instant bank QR & eSewa checkout for Musi AI, CapCut AI, ChatGPT Plus, and developer tools.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/products?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessJsonLd() {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "TRIHEX DIGITAL — 3x Digital AI Store",
    alternateName: ["3x Digital", "3X Digital", "TRIHEX Store Nepal"],
    url: origin,
    image: `${origin}/icon`,
    priceRange: "NPR 399 - NPR 23,999",
    currenciesAccepted: "NPR",
    paymentAccepted: "Bank Transfer, Fonepay QR, eSewa, Khalti",
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressLocality: "Kathmandu",
      addressRegion: "Bagmati",
    },
    areaServed: "Nepal",
    telephone: getWhatsAppDisplay(),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
}) {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: {
      "@type": "Organization",
      name: "TRIHEX DIGITAL",
    },
    publisher: {
      "@type": "Organization",
      name: "TRIHEX DIGITAL",
      logo: {
        "@type": "ImageObject",
        url: `${origin}/icon`,
      },
    },
    mainEntityOfPage: `${origin}/blog/${input.slug}`,
    inLanguage: "en-NP",
  };
}

export function faqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function productJsonLd(input: {
  name: string;
  description: string;
  slug: string;
  image?: string | null;
  priceNprMinor?: number | null;
  availability: "InStock" | "OutOfStock" | "PreOrder";
}) {
  const origin = getSiteUrl();
  const offer =
    input.priceNprMinor != null && input.priceNprMinor > 0
      ? {
          "@type": "Offer",
          url: `${origin}/products/${input.slug}`,
          priceCurrency: "NPR",
          price: (input.priceNprMinor / 100).toFixed(2),
          availability: `https://schema.org/${input.availability}`,
          seller: {
            "@type": "Organization",
            name: "TRIHEX DIGITAL",
          },
        }
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.slug,
    image: input.image ? [input.image.startsWith("http") ? input.image : `${origin}${input.image}`] : undefined,
    brand: {
      "@type": "Brand",
      name: "TRIHEX DIGITAL",
    },
    offers: offer,
  };
}

export function softwareApplicationJsonLd(input: {
  name: string;
  applicationCategory: string;
  operatingSystem?: string;
  description: string;
  slug: string;
  priceNprMinor?: number | null;
}) {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: input.name,
    alternateName: [`3x Digital ${input.name}`, `${input.name} Nepal`],
    applicationCategory: input.applicationCategory,
    operatingSystem: input.operatingSystem ?? "Web, Windows, macOS, Android, iOS",
    description: input.description,
    url: `${origin}/products/${input.slug}`,
    offers:
      input.priceNprMinor != null
        ? {
            "@type": "Offer",
            priceCurrency: "NPR",
            price: (input.priceNprMinor / 100).toFixed(2),
            availability: "https://schema.org/InStock",
            seller: {
              "@type": "Organization",
              name: "3x Digital (TRIHEX DIGITAL)",
            },
          }
        : undefined,
  };
}
