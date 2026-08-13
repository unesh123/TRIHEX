# Marketing

Marketing features in this build are **mostly admin UI shells** with demo notes. No live ad campaigns are running from this repository.

## AD_READY gate

Variants in seed data include `adReady?: boolean`. Example: Gemini 18-month manual price variant has `adReady: false`.

**A product must not be advertised until ALL of:**

| Gate | Requirement |
|------|-------------|
| Compliance | `compliance_status = APPROVED` |
| Publication | `product_status = PUBLIC` |
| Authorization | Vendor proof verified (or owned/API exception) |
| Pricing | Final NPR price set and contribution reviewed |
| `adReady` | Explicitly `true` on variant (admin toggle when wired) |
| Copy | No unverified supplier claims (especially screenshot imports) |

Blocked example: `gemini-pro-upgrade-link-18-months` is DRAFT with owner NPR 300 prepared — **not ad-ready**.

## Approved messaging

- State TRIHEX as independent retailer
- Use verified authorization language only
- Link to `/pricing-transparency` and `/verified-supply`
- Include trademark disclaimer from compliance module

## Prohibited tactics

- **No fake urgency** — avoid "only 2 left!" unless derived from real `LOW_STOCK` ledger state
- No countdown timers tied to unverified inventory
- No "official partner" claims without documentation on file
- No advertising BLOCKED categories (Cursor, ChatGPT consumer, etc.)

## Channels (planned)

| Area | Admin path | Status |
|------|------------|--------|
| Campaigns | `/admin/marketing/campaigns` | Demo shell |
| Media assets | `/admin/marketing/media` | Demo shell |
| Coupons | `/admin/marketing/coupons` | Schema + UI shell |

Coupons schema includes `requires_super_admin_below_floor` for sub-floor discounts.

## Owned products for demos

Three PUBLIC TRIHEX products are safe for internal mockups:

- AI Prompt Starter Pack
- Small Business AI Setup Consultation
- Custom Workflow Automation Discovery

Use these for creative tests — not screenshot-blocked third-party listings.

## Consent

Checkout captures `marketingConsent` (optional). Honor opt-out in future email sends.

## Related

- [COMPLIANCE.md](./COMPLIANCE.md)
- [PRICING_ENGINE.md](./PRICING_ENGINE.md)
