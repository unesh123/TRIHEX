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
    url: origin,
    logo: `${origin}/icon`,
    description:
      "Nepal-first digital storefront for AI and digital tools with NPR pricing, website checkout, and WhatsApp support.",
    telephone: getWhatsAppDisplay(),
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
      addressLocality: "Nepal",
    },
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
    sameAs: [`https://wa.me/${getWhatsAppNumber()}`],
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
    name: "TRIHEX DIGITAL",
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessJsonLd() {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "TRIHEX DIGITAL",
    url: origin,
    image: `${origin}/icon`,
    priceRange: "NPR",
    currenciesAccepted: "NPR",
    paymentAccepted: "Bank Transfer, eSewa, Khalti",
    address: {
      "@type": "PostalAddress",
      addressCountry: "NP",
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
