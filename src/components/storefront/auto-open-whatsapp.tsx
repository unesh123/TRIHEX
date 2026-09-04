"use client";

import { useEffect, useState } from "react";
import { MessageCircle, CheckCircle2, ArrowRight } from "lucide-react";

export function AutoOpenWhatsapp({
  whatsappUrl,
  orderNumber,
}: {
  whatsappUrl: string;
  orderNumber: string;
}) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!whatsappUrl || opened) return;
    const timer = setTimeout(() => {
      try {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        setOpened(true);
      } catch {
        // Popups might be blocked by browser; button is prominently visible below
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [whatsappUrl, opened]);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#25D366]/40 bg-[#25D366]/10 p-5 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-md">
          <MessageCircle className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/20 px-2 py-0.5 text-[11px] font-bold text-[#128C7E]">
              <CheckCircle2 className="h-3 w-3" /> Auto Message Ready
            </span>
          </div>
          <h3 className="mt-1.5 font-[family-name:var(--font-sora)] text-base font-bold text-[var(--text)]">
            Send Payment Proof on WhatsApp
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
            We pre-filled your order details for <strong>{orderNumber}</strong>. Click below to launch WhatsApp (+977 9702910130) and confirm your activation immediately.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white shadow-md transition duration-200 hover:bg-[#20ba5a] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Open WhatsApp & Send Message</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
