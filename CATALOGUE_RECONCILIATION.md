# CATALOGUE_RECONCILIATION

Updated: 2026-07-21

## Counts (seed + merchandising)

| Metric | Count |
|--------|------:|
| Total product records | 32 |
| Subscription / digital packages | 29 |
| Service / consultation records | 2 |
| Digital asset (Prompt Pack) | 1 |
| Visible public catalogue | 32 |
| Available (purchasable) | 3 |
| Out of stock | 0 |
| Under review | 10 |
| Unavailable / blocked | 19 |
| Hidden | 0 |
| Coming soon | 0 |

Purchasable set (APPROVED + PUBLIC): TRIHEX Prompt Pack, Small Business AI Setup, Workflow Automation Discovery.

## Demo services reclassification

| Record | Previous | New location | Type | Visibility |
|--------|----------|--------------|------|------------|
| AI Prompt Starter Pack | featured / mixed | Digital Assets | DOWNLOADABLE_OWNED_ASSET | PUBLIC / Available (not Featured) |
| Small Business AI Setup Consultation | featured service name | Services · customer name **Small Business AI Setup** | Consultation Service · 60-minute | PUBLIC / Bookable (not Featured) |
| Custom Workflow Automation Discovery Session | featured long name | Services · customer name **Workflow Automation Discovery** | Discovery Consultation · 60-minute | PUBLIC / Bookable (not Featured) |

Removed from AI Tools, Featured, and homepage popular AI grids. Historical seed slugs retained (no hard delete).

## Naming / package corrections (customer-facing)

| Before | After |
|--------|-------|
| Small Business AI Setup Consultation | Small Business AI Setup |
| Custom Workflow Automation Discovery Session | Workflow Automation Discovery |
| Category label “TRIHEX Services” for digital-assets | Digital Assets / Services |
| Supplier codes in titles (NW/FW/W15D/CDK/Mail A/B/…) | Stripped from primary titles |
| Availability badge “In Stock” for consultations | “Bookable” |

## Image policy

- Public covers: MODE B artwork-only WebP under `public/products/covers/{family}/`
- Full generated cards archived under `_full-cards/` (not used as storefront covers)
- Contact sheets never used as product covers
- Live price/status/warranty from merchandising model only

See `PRODUCT_IMAGE_MATRIX.md` and `GENERATED_CARD_CONFLICTS.md`.
