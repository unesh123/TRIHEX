import { activeElevenLabsOffer } from "@/lib/catalog/limited-offer";

export function LimitedOfferBanner({ slug }: { slug: string }) {
  const offer = activeElevenLabsOffer(slug);
  if (!offer) return null;
  return (
    <aside className="my-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-950">
      <p className="text-xs font-extrabold">3-day limited-time offer · Only NPR 1,000</p>
      <p className="mt-1 text-xs">ElevenLabs Creator · 1 month. Ends 24 October, 7:45 PM Nepal time.</p>
    </aside>
  );
}
