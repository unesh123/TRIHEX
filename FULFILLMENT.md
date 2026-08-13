# Fulfillment

TRIHEX delivers digital products and services through **permitted activation methods only**. We do **not** sell or deliver shared passwords for third-party consumer accounts.

## Permitted fulfillment types (schema)

From `fulfillmentTypeEnum` in `src/db/schema.ts`:

| Type | Typical use |
|------|-------------|
| `MANUAL_CUSTOMER_EMAIL_ACTIVATION` | Upgrade/activation on customer's email |
| `OFFICIAL_TEAM_INVITATION` | Team/workspace invite |
| `OFFICIAL_REDEEM_CODE` | Transferable official code from authorized supply |
| `API_POWERED_ACCESS` | API key or service-backed access |
| `DOWNLOADABLE_OWNED_ASSET` | TRIHEX-owned files |
| `MANAGED_SETUP_SERVICE` | Guided implementation |
| `CONSULTATION` | Scheduled session |
| `LICENSE_KEY_FROM_AUTHORIZED_DISTRIBUTOR` | Distributor key (with proof on file) |

Product type must align (`productTypeEnum`: `DIGITAL_LICENSE`, `TEAM_SEAT`, `REDEEM_CODE`, `OWNED_ASSET`, `CONSULTATION`, `MANAGED_SERVICE`, etc.).

## Forbidden practices

- Delivering **shared passwords** or "ready accounts" for consumer products blocked by compliance policy
- Cursor, Canva EDU, ChatGPT consumer, Claude personal, Adobe individual without authorized reseller proof — default **BLOCKED** (`src/lib/compliance/gate.ts`)
- Sending credentials via WhatsApp (use secure delivery when implemented: `secure_delivery_messages` table)

## Fulfillment gate

Orders must be **payment PAID** before fulfillment (`canFulfillOrder` in state machine).

Statuses: `NOT_STARTED` → `QUEUED` → `IN_PROGRESS` → `DELIVERED` → `CUSTOMER_CONFIRMED`.

## TRIHEX-owned demos (PUBLIC)

Three seed products use safe fulfillment:

| Product | Fulfillment |
|---------|-------------|
| AI Prompt Starter Pack | `DOWNLOADABLE_OWNED_ASSET` |
| Small Business AI Setup Consultation | `CONSULTATION` |
| Custom Workflow Automation Discovery | `MANAGED_SETUP_SERVICE` |

## Customer information

Fulfillment may require:

- Customer Google/email for activation (`customerAccountEmail` on fulfillments)
- Region/eligibility confirmation
- No delivery until `NEEDS_CUSTOMER_INFO` is resolved

## Redeem codes

Schema supports encrypted codes in `redeem_codes` with hash-based dedup. Not fully wired in demo mode.

## Admin

- Queue: `/admin/fulfillment`
- Per-product inventory: `/admin/products/[id]/inventory`
- Settings: `/admin/settings/orders`

## Warranties

Warranty snapshot stored on order items. TRIHEX does not infer warranty from supplier marketing copy (storefront policy pages).
