"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Zap, KeyRound, RefreshCw } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  icon?: typeof HelpCircle;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    question: "How do I receive access after completing payment?",
    answer:
      "Once you submit your payment screenshot on checkout, our team reviews it immediately. Access credentials, official invitation links, or activation codes are sent directly to your WhatsApp number (+977 9702910130) within 15–30 minutes during operating hours (9 AM – 11 PM NPT).",
    icon: Zap,
  },
  {
    question: "Is this a dedicated private account or shared?",
    answer:
      "Each plan badge clearly specifies whether it is 'Private Email' (activated directly on your own personal email) or 'Dedicated Profile'. We strictly enforce no double-booking or shared credential overlaps.",
    icon: KeyRound,
  },
  {
    question: "What is the TRIHEX Warranty & Replacement Policy?",
    answer:
      "Every purchasable subscription includes genuine warranty coverage. If you ever experience access interruption, subscription drops, or provider resets, simply ping us on WhatsApp with your Order Number for rapid re-activation or direct replacement.",
    icon: ShieldCheck,
  },
  {
    question: "Can I renew my existing account next month without losing history?",
    answer:
      "Yes! For popular tools like ChatGPT Plus, Claude Pro, Canva, and Cursor, we support direct consecutive renewals so your projects, custom prompts, and workspace history remain intact.",
    icon: RefreshCw,
  },
  {
    question: "Which Nepal payment gateways can I use?",
    answer:
      "You can scan our universal QR code directly from any Nepal Mobile Banking app (NIC Asia, Nabil, Global IME, Sanima, etc.) via Fonepay, or pay via eSewa and Khalti without any extra convenience surcharge.",
    icon: HelpCircle,
  },
];

export function PDPFaq({
  productTitle,
  customFaqs,
}: {
  productTitle?: string;
  customFaqs?: FAQItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = customFaqs && customFaqs.length > 0 ? customFaqs : DEFAULT_FAQS;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="mt-8 rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <HelpCircle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-[family-name:var(--font-sora)] text-lg font-semibold text-slate-900">
            Frequently Asked Questions {productTitle ? `— ${productTitle}` : ""}
          </h3>
          <p className="text-xs text-slate-500">
            Clear, transparent answers on activation, warranty, and payment
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const Icon = faq.icon || HelpCircle;

          return (
            <div key={idx} className="py-3.5 transition">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between text-left font-medium text-slate-800 hover:text-indigo-600 transition"
              >
                <span className="flex items-center gap-2.5 text-sm sm:text-base font-semibold">
                  <Icon className="h-4 w-4 text-indigo-500 shrink-0" />
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-indigo-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-2.5 pl-6 text-sm leading-relaxed text-slate-600 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
