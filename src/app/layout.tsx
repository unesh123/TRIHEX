import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import {
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
  localBusinessJsonLd,
} from "@/components/seo/json-ld";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TRIHEX DIGITAL (3x Digital) — #1 AI Subscriptions & Digital Tools in Nepal",
    template: "%s · TRIHEX DIGITAL (3x Digital)",
  },
  description:
    "Nepal's premier store for AI subscriptions: Musi AI, CapCut AI, ChatGPT Plus, Cursor Pro, Claude Pro & Gemini. Transparent NPR pricing, instant bank QR & eSewa checkout, WhatsApp support.",
  applicationName: "TRIHEX DIGITAL",
  keywords: [
    "3x Digital",
    "3X Digital",
    "3x Digital Musi AI subscription",
    "Musi AI",
    "Musi AI subscription Nepal",
    "MuseAI Nepal",
    "3x Digital CapCut AI subscription",
    "CapCut Pro Nepal",
    "CapCut AI subscription",
    "3x Digital ChatGPT subscription",
    "ChatGPT Plus Nepal",
    "ChatGPT subscription Nepal",
    "Cursor Pro Nepal",
    "Cursor AI subscription 3x Digital",
    "Claude Pro Nepal",
    "Gemini Pro Nepal",
    "ElevenLabs Nepal",
    "AI tools Nepal",
    "TRIHEX DIGITAL",
    "digital products NPR",
    "buy AI subscription Nepal",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: siteUrl,
    siteName: "TRIHEX DIGITAL (3x Digital)",
    title: "TRIHEX DIGITAL (3x Digital) — #1 AI Subscriptions & Digital Tools in Nepal",
    description:
      "Buy Musi AI, CapCut AI, ChatGPT Plus, and Cursor Pro in Nepal with transparent NPR pricing, bank QR checkout, and instant WhatsApp support.",
    images: [
      {
        url: `${siteUrl}/brand/trihex-mark.webp`,
        width: 1200,
        height: 630,
        alt: "TRIHEX DIGITAL (3x Digital) — #1 AI Subscriptions in Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TRIHEX DIGITAL (3x Digital) — #1 AI Subscriptions & Digital Tools in Nepal",
    description:
      "Transparent NPR pricing, bank QR checkout, and instant WhatsApp support for all top AI subscriptions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  classification: "Artificial Intelligence, Developer Tools, Software Subscriptions",
  other: {
    "llms": `${siteUrl}/llms.txt`,
    "llms-full": `${siteUrl}/llms-full.txt`,
    "ai-content-declaration": "commercial-digital-storefront",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col font-sans overflow-x-clip"
        // Some browser extensions annotate body before React hydrates. Suppress
        // that root-only noise without hiding component-level hydration errors.
        suppressHydrationWarning
      >
        <JsonLd
          data={[
            organizationJsonLd(),
            websiteJsonLd(),
            localBusinessJsonLd(),
          ]}
        />
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
