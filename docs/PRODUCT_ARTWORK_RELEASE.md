# Product artwork and owner catalogue update — 21 October 2026

## Scope and coordination

This change replaces text posters with price-free generated raster artwork, shared across duration variants. It adds MuseAI at NPR 399 with **1 billion tokens and no time-based duration**. ElevenLabs Creator's existing one-month SKU has a fixed 72-hour NPR 1,000 campaign from 21 October 2026 19:45 to 24 October 2026 19:45 Nepal time. Three days is interpreted as the sale window, not the access duration.

Antigravity is concurrently editing authentication, checkout, VIP and admin workflows in this checkout. The release is prepared separately from the verified production commit `a6b38cda58c68e30c4f97fa5db45e8bba8ed2fd4`, with only this task's changes applied. Check production again before promotion to avoid replacing a newer deployment.

## Images

Generated using the imagegen skill's built-in tool mode. ElevenLabs uses the existing microphone artwork as an edit reference, removing all lettering and prices. Other assets are newly generated brand-inspired artwork, not official vendor images. Source PNGs remain in the Codex generated-images folder. `artwork-sources.json` records the local source per asset; the deployed files are in `public/media/artwork/`.

Generation brief: premium square ecommerce artwork; photorealistic 3D studio advertising render; tactile materials, refined soft lighting and rich depth; a central composition readable at thumbnail size; 12% safe margins; no text, lettering, numbers, prices, labels or watermark. Each subject is tailored to its product family. Full per-product prompts are recorded alongside completion results.

`scripts/compress-premium-artwork.mjs` converts sources to sRGB 960×960 WebP, reducing quality only as needed to remain below 180,000 bytes each. Next Image serves responsive sizes. The shared resolver replaces legacy posters while retaining subsequent admin uploads.

## Catalogue data

`scripts/sync-owner-artwork.ts` defaults to a dry run. Apply only after all referenced images are deployed and verified. It updates primary media and inserts MuseAI without reseeding stock, orders, credentials or the rest of the catalogue.

MuseAI remains available for enquiry while supply/account activation details are unverified. No authorization proof, inventory or approval has been invented. Its confirmed token allowance, price and absence of a time duration are preserved in both seed and database records.

The campaign price is applied in merchandising and server-side order pricing, and automatically returns to the regular price at expiry. Other ElevenLabs SKUs are excluded.

## Existing platform findings

- The initial workspace test run passed 58 files / 298 tests. Type checking passed. The shared production build also passed.
- Full repository lint reported 148 errors and 511 warnings. These are broader than this artwork release and are not a clean platform health result.
- Builds reported missing `prompts` and `deal_candidates` tables and used in-memory fallbacks. Those features cannot be described as fully persistent until their database migrations are reconciled.
- Live ElevenLabs data has missing vendor proof and unknown supply authorization. Existing purchase gates can reject checkout even though merchandising presents the product as available. Do not bypass those gates or manufacture proof.
- Parallel build workers exhausted the database's 200-client limit with ten connections per worker. This release reduces each client pool to two connections, with idle and connect timeouts.
- A successful HTTP response or `/api/health` response does not demonstrate complete admin, fulfillment or paid checkout functionality.

## Final validation

Pending artwork completion, asset audit, release tests, visual inspection, deployment and live verification. Update this section with actual results before calling the release complete.
