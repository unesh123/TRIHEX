# Compliance

TRIHEX DIGITAL treats compliance as a **server-side and database-enforced** gate — not a storefront checkbox.

Implementation: `src/lib/compliance/gate.ts`, DB check on `products` table.

## Publication rules

A product is **purchasable** only when:

1. `product_status = PUBLIC`
2. `compliance_status = APPROVED`
3. `supply_authorization_type ≠ UNKNOWN`
4. Vendor proof **VERIFIED** (unless owned/API supply — see below)
5. Authorization not expired (`proof_expiry_date`)

`evaluatePublication()` returns `canPublish`, `canPurchase`, and `reasons[]`.

### Owned / API exceptions

These types may skip third-party vendor proof if `APPROVED`:

- `OWN_DIGITAL_PRODUCT`
- `MANAGED_IMPLEMENTATION_SERVICE`
- `API_POWERED_SERVICE`

## Default blocked categories

`isDefaultBlockedProduct()` auto-blocks:

| Target | Reason |
|--------|--------|
| **Cursor** | Third-party resellers not authorized per public policy |
| **Canva EDU** | Must not be sold as commercial consumer product |
| **ChatGPT consumer** | Blocked unless business seat or API service |
| **Claude personal** | Blocked unless official business/enterprise/API |
| **Adobe individual** | Blocked unless `AUTHORIZED_RESELLER` |

Seed catalogue: **29 screenshot-derived products** are `BLOCKED` or `DRAFT` — not PUBLIC. Only **3 TRIHEX-owned** products are PUBLIC demos.

## Compliance statuses

`UNREVIEWED` | `DOCUMENTS_REQUIRED` | `APPROVED` | `REJECTED` | `SUSPENDED`

## Vendor proof statuses

`NOT_UPLOADED` | `PENDING_REVIEW` | `VERIFIED` | `EXPIRED` | `REJECTED`

## Admin workflow

1. Catalog manager uploads authorization evidence
2. **Different** compliance reviewer approves (not self-approve for catalog managers)
3. Product moves toward `PUBLIC` only when gate passes
4. Admin compliance UI: `/admin/compliance`, `/admin/products/[id]/compliance`

## Storefront disclaimer

`COMPLIANCE_FOOTER_DISCLAIMER`:

> TRIHEX DIGITAL is an independent digital-services retailer. Third-party product names and trademarks belong to their respective owners. Affiliation or authorization is stated only where verified.

## Checkout enforcement

`createOrder()` calls `evaluatePublication()` — blocked products return `COMPLIANCE` error at checkout.

## Marketing gate

Variants carry `adReady: boolean` in seed data. Ads require compliance + `adReady` — see [MARKETING.md](./MARKETING.md).

## Data verification

Products flagged `needsDataVerification` appear in `/admin/compliance/reviews` — screenshot imports must not become verified claims without human review.
