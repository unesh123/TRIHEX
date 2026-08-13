import { describe, expect, it } from "vitest";
import {
  createQuote,
  getQuoteBySecureToken,
  updateQuoteStatus,
} from "@/lib/quotes/store";

describe("quote workflow", () => {
  it("creates a private, trackable business quote request", async () => {
    const quote = await createQuote({
      customerName: "Unesh Bastola",
      businessName: "TRIHEX DIGITAL",
      customerPhone: "9812345678",
      teamSize: "2–5 people",
      budgetRange: "Rs. 5,000–15,000",
      goal: "Reduce manual customer order follow-up work.",
      currentTools: "WhatsApp and Google Sheets",
    });

    expect(quote.reference).toMatch(/^THX-Q-\d{6}-[A-Z0-9]{5}$/);
    expect(quote.secureToken.length).toBeGreaterThan(30);
    expect(quote.status).toBe("REQUESTED");
    expect(quote.events[0]?.eventType).toBe("QUOTE_REQUESTED");

    const tracked = await getQuoteBySecureToken(quote.secureToken);
    expect(tracked?.reference).toBe(quote.reference);
    expect(tracked?.customerPhone).toBe("9812345678");
  });

  it("records a customer-visible quote status update", async () => {
    const quote = await createQuote({
      customerName: "Quote Customer",
      businessName: "Example Nepal",
      customerPhone: "9812345678",
      goal: "Plan a responsible AI support workflow.",
    });

    const updated = await updateQuoteStatus({
      quoteId: quote.id,
      status: "SCOPING",
      message: "TRIHEX is reviewing the scope and delivery milestones.",
    });

    expect(updated?.status).toBe("SCOPING");
    expect(updated?.events[0]?.eventType).toBe("STATUS_SCOPING");
    expect(updated?.events[0]?.message).toContain("reviewing the scope");
  });
});
