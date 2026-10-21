/** Fixed campaign window: never restarts on a visit or deployment. */
export const ELEVENLABS_OFFER = {
  slug: "elevenlabs-creator-shared",
  sku: "ELV-1M-CREATOR",
  startsAt: "2026-10-21T14:00:00Z",
  endsAt: "2026-10-24T14:00:00Z",
  priceNprMinor: 100000,
} as const;

export function activeElevenLabsOffer(slug: string, now = Date.now()) {
  return slug === ELEVENLABS_OFFER.slug &&
    now >= Date.parse(ELEVENLABS_OFFER.startsAt) &&
    now < Date.parse(ELEVENLABS_OFFER.endsAt)
    ? ELEVENLABS_OFFER : null;
}

export function campaignPrice(slug: string, sku: string, regularPrice: number | null | undefined, now = Date.now()) {
  const offer = activeElevenLabsOffer(slug, now);
  return offer && sku === offer.sku ? offer.priceNprMinor : regularPrice;
}
