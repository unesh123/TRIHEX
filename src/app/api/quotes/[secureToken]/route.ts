import { NextResponse } from "next/server";
import { getQuoteBySecureToken } from "@/lib/quotes/store";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ secureToken: string }> },
) {
  const { secureToken } = await params;
  const quote = await getQuoteBySecureToken(secureToken);
  if (!quote) {
    return NextResponse.json({ ok: false, error: "Quote not found." }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    quote: {
      reference: quote.reference,
      customerName: quote.customerName,
      businessName: quote.businessName,
      teamSize: quote.teamSize ?? null,
      budgetRange: quote.budgetRange ?? null,
      goal: quote.goal,
      currentTools: quote.currentTools ?? null,
      status: quote.status,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      validUntil: quote.validUntil,
      events: quote.events,
    },
  });
}
