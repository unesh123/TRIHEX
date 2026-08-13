"use client";

import {
  getWhatsAppDisplay,
  buildWhatsAppUrl,
} from "@/lib/whatsapp";

/**
 * Floating WhatsApp support button — positioned to avoid checkout CTAs
 * (bottom-right with offset above typical sticky bars).
 */
export function WhatsAppFloatingButton() {
  const href = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I need support with a product or order.",
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp ${getWhatsAppDisplay()}`}
      className="fixed bottom-20 right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-[#1f9e5a] px-4 text-sm font-semibold text-white shadow-lg shadow-black/40 transition hover:bg-[#25b868] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:bottom-6 sm:right-6"
    >
      <span aria-hidden className="text-lg">
        ✆
      </span>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
