# Product artwork and owner catalogue update — 21 October 2026

## Scope and coordination

This change replaces text posters with price-free generated raster artwork, shared across duration variants. It adds MuseAI at NPR 399 with **1 billion tokens and no time-based duration**. ElevenLabs Creator's existing one-month SKU has a fixed 72-hour NPR 1,000 campaign from 21 October 2026 19:45 to 24 October 2026 19:45 Nepal time. Three days is interpreted as the sale window, not the access duration.

Antigravity is concurrently editing authentication, checkout, VIP and admin workflows in this checkout. The final release is prepared separately from the newest committed baseline `88790ae0f5984f468bbab9188c2b02079578870e`, preserving the recent security changes. The older isolated release from 21 October is superseded and must not be deployed.

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
- The latest test run passes 59 files / 302 tests. Type checking and the current production build pass. Full repository lint now has zero errors and 631 warnings.
- An updated database table audit finds all 62 expected tables present. The earlier missing-table issue has been resolved at the table-presence level; persistence still needs feature-level verification.
- Live ElevenLabs data has missing vendor proof and unknown supply authorization. Existing purchase gates can reject checkout even though merchandising presents the product as available. Do not bypass those gates or manufacture proof.
- Parallel build workers exhausted the database's 200-client limit with ten connections per worker. This release reduces each client pool to two connections, with idle and connect timeouts.
- A successful HTTP response or `/api/health` response does not demonstrate complete admin, fulfillment or paid checkout functionality.

## Final validation

All 72 images are generated and visually inspected as a contact sheet. The asset audit covers 168 current catalogue products with zero missing files or mapping errors. All assets are 960×960 WebP, the largest is 179,864 bytes, and the complete set is 8,214,026 bytes. Full per-product subjects are in `artwork-generation-prompts.json`.

The final deployment was built from `C:/Users/unesh/.codex/trihex-complete-artwork-20261022`, retaining the latest committed security changes. Production deployment `dpl_6yz6jimRU4Q8WxkZXGFWeCKQzBCi` is READY and promoted to https://trihexdigital.shop. All 72 live image URLs pass format/payload checks; home, catalogue, MuseAI, ElevenLabs, admin login and health endpoints return HTTP 200. The staged MuseAI asset's SHA-256 matches the local file. Desktop (1440px) and mobile (390px) MuseAI/ElevenLabs browser checks show loaded images, no horizontal overflow and no JavaScript errors. The database media sync completed for all 168 current products; a pre-update media backup is retained in the ignored `data/backups/` folder.

See `CURRENT_STATUS_AND_FIX_PLAN_2026-10-22.md` for the remaining Google/VIP/admin findings; this image release does not resolve those authentication issues. Antigravity's new uncommitted auth work is excluded. Full live-check evidence is in `artifacts/artwork-check/`.
