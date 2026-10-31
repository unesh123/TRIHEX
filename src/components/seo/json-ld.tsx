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
      "Trihex Store Nepal",
    ],
    url: origin,
    logo: `${origin}/icon`,
    image: `${origin}/brand/trihex-mark.webp`,
    description:
      "Nepal's #1 digital storefront for AI and digital tools. Official 3x Digital subscriptions for Musi AI (Muse.ai), CapCut Pro AI, ChatGPT Plus, Cursor Pro, Claude Pro, and Gemini with transparent NPR pricing, bank QR checkout, and WhatsApp support.",
    telephone: getWhatsAppDisplay(),
    email: "support@trihexdigital.shop",
    currenciesAccepted: "NPR",
    paymentAccepted: "Fonepay QR, eSewa, Khalti, ConnectIPS, Direct Bank Transfer",
    knowsAbout: [
      "Musi AI subscription Nepal",
      "3x Digital Musi AI tokens",
      "Muse.ai Nepal",
      "CapCut Pro AI subscription",
      "3x Digital CapCut",
      "ChatGPT Plus Nepal eSewa",
      "3x Digital ChatGPT",
      "Cursor Pro AI Nepal",
      "Claude Pro Nepal",
      "Claude Code API Nepal",
      "Google Gemini AI Pro Nepal",
      "Higgsfield Pro Nepal",
      "Runway Pro Nepal",
      "AI tools Nepal",
      "Nepal digital subscriptions",
      "Artificial Intelligence software in NPR",
      "Buy AI subscriptions in Nepal without dollar card",
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
      `${origin}/llms.txt`,
      `${origin}/llms-full.txt`,
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "TRIHEX DIGITAL AI Subscriptions Catalog",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "AI Video & Audio Intelligence",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Musi AI (Muse.ai) Tokens" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "ElevenLabs Creator" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "CapCut Pro Full Warranty" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Higgsfield Pro" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Runway Pro" } },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "Conversational AI & LLMs",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "ChatGPT Plus Full Warranty" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Claude Pro Anthropic" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Google Gemini AI Pro" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Super Grok xAI" } },
          ],
        },
        {
          "@type": "OfferCatalog",
          name: "AI Coding & Developer Infrastructure",
          itemListElement: [
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cursor Pro AI Code Editor" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Claude Code API Access" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Supabase Pro" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Factory Droid AI" } },
            { "@type": "Offer", itemOffered: { "@type": "Service", name: "Railway Hobby" } },
          ],
        },
      ],
    },
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
    priceRange: "NPR 199 - NPR 29,999",
    currenciesAccepted: "NPR",
    paymentAccepted: "Bank Transfer, Fonepay QR, eSewa, Khalti, ConnectIPS",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "07:00",
        closes: "23:00",
      },
    ],
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
  plans?: Array<{
    id: string;
    durationLabel: string;
    accessLabel: string;
    priceNpr: number;
    availability: string;
  }>;
}) {
  const origin = getSiteUrl();
  const url = `${origin}/products/${input.slug}`;

  let offers: Record<string, unknown> | undefined;

  if (input.plans && input.plans.length > 1) {
    const validPlans = input.plans.filter((p) => p.priceNpr > 0);
    const prices = validPlans.map((p) => p.priceNpr);
    const lowPrice = Math.min(...prices);
    const highPrice = Math.max(...prices);

    offers = {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "NPR",
      lowPrice: lowPrice.toFixed(2),
      highPrice: highPrice.toFixed(2),
      offerCount: validPlans.length,
      offers: validPlans.map((p) => ({
        "@type": "Offer",
        url,
        name: `${p.durationLabel} (${p.accessLabel})`,
        price: p.priceNpr.toFixed(2),
        priceCurrency: "NPR",
        availability:
          p.availability === "available"
            ? "https://schema.org/InStock"
            : "https://schema.org/PreOrder",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "TRIHEX DIGITAL (3x Digital)",
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0.00",
            currency: "NPR",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 0,
              maxValue: 1,
              unitCode: "HUR",
            },
          },
        },
      })),
    };
  } else if (input.priceNprMinor != null && input.priceNprMinor > 0) {
    offers = {
      "@type": "Offer",
      url,
      priceCurrency: "NPR",
      price: (input.priceNprMinor / 100).toFixed(2),
      availability: `https://schema.org/${input.availability}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "TRIHEX DIGITAL (3x Digital)",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0.00",
          currency: "NPR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "HUR",
          },
        },
      },
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    sku: input.slug,
    image: input.image
      ? [input.image.startsWith("http") ? input.image : `${origin}${input.image}`]
      : undefined,
    brand: {
      "@type": "Brand",
      name: "TRIHEX DIGITAL",
    },
    offers,
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
