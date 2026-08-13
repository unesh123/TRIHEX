import { NextResponse } from "next/server";
import { getLiveMerchandisingCatalogue } from "@/lib/catalog/merchandising";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  const cards = await getLiveMerchandisingCatalogue({
    query: q,
    includeBlocked: false,
  });

  return NextResponse.json({
    items: cards.slice(0, 8).map((c) => ({
      slug: c.slug,
      title: c.title,
      brandName: c.brandName,
    })),
  });
}
