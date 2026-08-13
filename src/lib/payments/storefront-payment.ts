/**
 * Customer-facing payment instructions (public QR + copy).
 * Same QR works for bank apps, eSewa, and Khalti scan-to-pay.
 * Rotate QR by replacing public/media/payments/bank-qr.webp
 */
export const STOREFRONT_BANK_QR_PATH = "/media/payments/bank-qr.webp?v=3";

export const STOREFRONT_PAYEE_NAME = "TRIHEX DIGITAL";

export const STOREFRONT_PAYMENT_HINTS = {
  bank: {
    title: "Bank / eSewa / Khalti — same QR",
    remarks: "Put your order number in the payment remarks.",
    steps: [
      "Open your Bank app, eSewa, or Khalti",
      "Scan this same TRIHEX QR",
      "Pay the exact NPR total",
      "Upload the payment screenshot below",
    ],
  },
  esewa: {
    title: "eSewa — scan the same QR",
    steps: [
      "Open eSewa → Scan QR (or pay to the QR below)",
      "Pay the exact NPR total to TRIHEX DIGITAL",
      "Add your name / order note in remarks if asked",
      "Upload the eSewa success screenshot below",
    ],
  },
  khalti: {
    title: "Khalti — scan the same QR",
    steps: [
      "Open Khalti → Scan QR (or pay to the QR below)",
      "Pay the exact NPR total to TRIHEX DIGITAL",
      "Add your name / order note in remarks if asked",
      "Upload the Khalti success screenshot below",
    ],
  },
} as const;
