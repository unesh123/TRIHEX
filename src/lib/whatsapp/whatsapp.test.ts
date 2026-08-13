import { describe, expect, it } from "vitest";
import {
  buildWhatsAppUrl,
  normalizeWhatsAppNumber,
  orderVerificationMessage,
  paymentStatusInquiryMessage,
  productEnquiryMessage,
  DEFAULT_WHATSAPP_NUMBER,
} from "@/lib/whatsapp";

describe("whatsapp", () => {
  it("normalizes Nepali numbers to 977…", () => {
    expect(normalizeWhatsAppNumber("9702910130")).toBe("9779702910130");
    expect(normalizeWhatsAppNumber("+977 9702910130")).toBe("9779702910130");
    expect(normalizeWhatsAppNumber(DEFAULT_WHATSAPP_NUMBER)).toBe(
      "9779702910130",
    );
  });

  it("builds encoded wa.me links", () => {
    const url = buildWhatsAppUrl(
      productEnquiryMessage("AI Prompt Pack", "Digital Download"),
    );
    expect(url.startsWith("https://wa.me/9779702910130?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent("AI Prompt Pack"));
  });

  it("rejects passwords and UUIDs in messages", () => {
    expect(() => buildWhatsAppUrl("here is my password: secret")).toThrow();
    expect(() =>
      buildWhatsAppUrl(
        "order id 550e8400-e29b-41d4-a716-446655440000",
      ),
    ).toThrow();
  });

  it("order verification message uses order number not UUID", () => {
    const msg = orderVerificationMessage({
      orderNumber: "THX-260721-123456",
      amountNprWhole: 300,
      paymentMethod: "BANK_TRANSFER",
    });
    expect(msg).toContain("THX-260721-123456");
    expect(msg).toContain("NPR 300");
    expect(msg).not.toMatch(/[0-9a-f-]{36}/i);
  });

  it("payment status inquiry uses order number", () => {
    const msg = paymentStatusInquiryMessage({
      orderNumber: "THX-260721-123456",
      amountNprWhole: 300,
    });
    expect(msg).toContain("payment status");
    expect(msg).toContain("THX-260721-123456");
  });
});
