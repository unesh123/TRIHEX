import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { getSiteUrl } from "@/lib/site";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
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
    default: "TRIHEX DIGITAL — Premium AI & Digital Tools for Nepal",
    template: "%s · TRIHEX DIGITAL",
  },
  description:
    "Buy AI and digital tools in Nepal with transparent NPR prices, bank QR checkout, payment proof upload, and WhatsApp support.",
  applicationName: "TRIHEX DIGITAL",
  keywords: [
    "TRIHEX DIGITAL",
    "Nepal",
    "AI tools Nepal",
    "ChatGPT Nepal",
    "Gemini Nepal",
    "CapCut Pro Nepal",
    "digital products NPR",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: siteUrl,
    siteName: "TRIHEX DIGITAL",
    title: "TRIHEX DIGITAL — Premium AI & Digital Tools for Nepal",
    description:
      "Transparent NPR pricing, website checkout, bank QR pay, and local WhatsApp support.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRIHEX DIGITAL — Premium AI & Digital Tools for Nepal",
    description:
      "Transparent NPR pricing, website checkout, and WhatsApp support.",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${manrope.variable} ${sora.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col font-sans overflow-x-clip"
        // Some browser extensions annotate body before React hydrates. Suppress
        // that root-only noise without hiding component-level hydration errors.
        suppressHydrationWarning
      >
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
