import { NextResponse } from "next/server";
import { createQuote, type QuoteRequestInput } from "@/lib/quotes/store";

export const dynamic = "force-dynamic";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Quote request could not be created.";
}

export async function POST(request: Request) {
  let body: Partial<QuoteRequestInput>;
  try {
    body = (await request.json()) as Partial<QuoteRequestInput>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  try {
    const quote = await createQuote({
      customerName: String(body.customerName ?? ""),
      businessName: String(body.businessName ?? ""),
      customerPhone: String(body.customerPhone ?? ""),
      teamSize: body.teamSize ? String(body.teamSize) : undefined,
      budgetRange: body.budgetRange ? String(body.budgetRange) : undefined,
      goal: String(body.goal ?? ""),
      currentTools: body.currentTools ? String(body.currentTools) : undefined,
    });

    return NextResponse.json({
      ok: true,
      quote: {
        reference: quote.reference,
        secureToken: quote.secureToken,
        status: quote.status,
        createdAt: quote.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: errorMessage(error) },
      { status: 400 },
    );
  }
}
