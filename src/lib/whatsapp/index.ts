/**
 * WhatsApp link builder for TRIHEX DIGITAL.
 * Destination is configuration-controlled. Never put secrets in messages.
 */

import { getSiteUrl } from "@/lib/site";

export const DEFAULT_WHATSAPP_NUMBER = "9779702910130";
export const DEFAULT_WHATSAPP_DISPLAY = "+977 9702910130";

const FORBIDDEN_PATTERNS = [
  /password/i,
  /\botp\b/i,
  /recovery\s*code/i,
  /license\s*key/i,
  /redeem\s*code/i,
  /https?:\/\/\S*proof/i,
  /our\s+supplier\s+cost/i,
  /cost\s*npr\s*[:=]/i,
];

export function getWhatsAppNumber(): string {
  const raw =
    process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER;
  return normalizeWhatsAppNumber(raw);
}

export function getWhatsAppDisplay(): string {
  return (
    process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY ?? DEFAULT_WHATSAPP_DISPLAY
  );
}

/** Strip to digits only; ensure Nepal country code 977 prefix. */
export function normalizeWhatsAppNumber(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("977") && digits.length >= 12) return digits;
  if (digits.length === 10 && digits.startsWith("9")) return `977${digits}`;
  return digits;
}

function assertSafeMessage(message: string): void {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(message)) {
      throw new Error(
        `WhatsApp message rejected: contains forbidden sensitive content (${pattern}).`,
      );
    }
  }
  if (
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i.test(
      message,
    )
  ) {
    throw new Error(
      "WhatsApp message rejected: private database UUID must not be shared.",
    );
  }
}

export function buildWhatsAppUrl(
  message: string,
  number = getWhatsAppNumber(),
): string {
  assertSafeMessage(message);
  const dest = normalizeWhatsAppNumber(number);
  return `https://wa.me/${dest}?text=${encodeURIComponent(message)}`;
}

function siteOrigin(): string {
  return getSiteUrl();
}

export type ProductEnquiryOpts = {
  productName: string;
  variantName: string;
  slug?: string;
  priceLabel?: string | null;
  compareAtLabel?: string | null;
  features?: string[];
};

/** Structured product enquiry — link + package + plan features. */
export function productEnquiryMessage(opts: ProductEnquiryOpts | string, variantName?: string): string {
  // Back-compat: productEnquiryMessage(name, variant)
  if (typeof opts === "string") {
    return productEnquiryMessage({
      productName: opts,
      variantName: variantName ?? "Standard",
    });
  }

  const lines: string[] = [
    "Hello TRIHEX DIGITAL 👋",
    "",
    "I want to check availability / inquire about:",
    `• Product: ${opts.productName}`,
    `• Package: ${opts.variantName}`,
  ];

  if (opts.priceLabel) {
    lines.push(
      opts.compareAtLabel
        ? `• Listed price: ${opts.priceLabel} (was ${opts.compareAtLabel})`
        : `• Listed price: ${opts.priceLabel}`,
    );
  }

  if (opts.slug) {
    lines.push(`• Product link: ${siteOrigin()}/products/${opts.slug}`);
  }

  const feats = (opts.features ?? []).filter(Boolean).slice(0, 8);
  if (feats.length) {
    lines.push("", "What this plan includes:");
    for (const f of feats) lines.push(`✓ ${f}`);
  }

  lines.push(
    "",
    "Please confirm if you have this available.",
    "If yes, tell me how to pay (bank / eSewa / Khalti QR).",
    "After payment verification, please deliver on WhatsApp.",
    "Thank you!",
  );

  return lines.join("\n");
}

export function orderVerificationMessage(opts: {
  orderNumber: string;
  amountNprWhole: number;
  paymentMethod: string;
  productName?: string;
  variantName?: string;
}): string {
  const method = opts.paymentMethod
    .replace(/_/g, " ")
    .replace(/\bMANUAL\b/gi, "")
    .trim();
  const lines = [
    "Namaste TRIHEX DIGITAL 👋",
    "",
    "I have completed my payment. Please verify and initiate activation.",
    "",
    `• Order Number: ${opts.orderNumber}`,
  ];
  if (opts.productName) {
    lines.push(`• Item: ${opts.productName}${opts.variantName ? ` (${opts.variantName})` : ""}`);
  }
  lines.push(
    `• Amount Paid: NPR ${opts.amountNprWhole.toLocaleString("en-NP")}`,
    `• Payment Method: ${method}`,
    "",
    "Payment screenshot is attached / uploaded on your website.",
    "Please verify and send my activation details here on WhatsApp.",
    "Thank you!",
  );
  return lines.join("\n");
}

/** Customer asks about payment / order status after placing order. */
export function paymentStatusInquiryMessage(opts: {
  orderNumber: string;
  amountNprWhole?: number;
}): string {
  const lines = [
    "Hello TRIHEX DIGITAL 👋",
    "",
    "I want to inquire about my order payment status.",
    "",
    `• Order: ${opts.orderNumber}`,
  ];
  if (opts.amountNprWhole != null && opts.amountNprWhole > 0) {
    lines.push(
      `• Amount: NPR ${opts.amountNprWhole.toLocaleString("en-NP")}`,
    );
  }
  lines.push(
    "",
    "I have already paid / uploaded proof. Please confirm payment status and next steps for delivery. Thank you!",
  );
  return lines.join("\n");
}

export function orderSupportMessage(opts: {
  orderNumber: string;
  publicStatus: string;
}): string {
  return [
    "Hello TRIHEX DIGITAL 👋",
    "",
    `I need help with order *${opts.orderNumber}*`,
    `• Current website status: ${opts.publicStatus}`,
    "",
    "Please assist. Thank you!",
  ].join("\n");
}

export function productEnquiryUrl(
  productNameOrOpts: string | ProductEnquiryOpts,
  variantName?: string,
): string {
  if (typeof productNameOrOpts === "string") {
    return buildWhatsAppUrl(
      productEnquiryMessage({
        productName: productNameOrOpts,
        variantName: variantName ?? "Standard",
      }),
    );
  }
  return buildWhatsAppUrl(productEnquiryMessage(productNameOrOpts));
}

export function orderVerificationUrl(opts: {
  orderNumber: string;
  amountNprWhole: number;
  paymentMethod: string;
  productName?: string;
  variantName?: string;
}): string {
  return buildWhatsAppUrl(orderVerificationMessage(opts));
}

export function paymentStatusInquiryUrl(opts: {
  orderNumber: string;
  amountNprWhole?: number;
}): string {
  return buildWhatsAppUrl(paymentStatusInquiryMessage(opts));
}

export function orderSupportUrl(opts: {
  orderNumber: string;
  publicStatus: string;
}): string {
  return buildWhatsAppUrl(orderSupportMessage(opts));
}
