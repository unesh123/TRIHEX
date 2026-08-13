"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getWhatsAppDisplay, buildWhatsAppUrl } from "@/lib/whatsapp";

const SUPPORT_SUPPRESSED_PATHS = ["/admin", "/checkout", "/orders", "/track-order", "/products"];

function shouldSuppress(pathname: string) {
  return SUPPORT_SUPPRESSED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Contextual support escape hatch. Product details, checkout, private order
 * pages, and tracking already offer purpose-specific support, so this control
 * avoids competing with their primary tasks.
 */
export function WhatsAppFloatingButton() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const suppressed = shouldSuppress(pathname);
  const visible = hasScrolled && !suppressed;
  const href = buildWhatsAppUrl(
    "Hello TRIHEX DIGITAL. I need support with a product or order.",
  );

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 360);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat on WhatsApp ${getWhatsAppDisplay()}`}
      aria-hidden={!visible}
      tabIndex={visible ? undefined : -1}
      className={`fixed bottom-24 right-4 z-30 flex h-12 items-center gap-2 rounded-full bg-[#1f9e5a] px-4 text-sm font-semibold text-white shadow-lg shadow-black/25 transition-[opacity,transform,background-color] duration-200 hover:bg-[#25b868] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:bottom-6 lg:right-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
