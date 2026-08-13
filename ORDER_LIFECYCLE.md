# Order Lifecycle

State machines: `src/lib/orders/state-machine.ts`. Schema enums mirror these values in `src/db/schema.ts`.

**The website is authoritative.** Customer-facing status on `/track-order` and `/orders/[secureToken]` overrides WhatsApp or email claims.

## Order status

| Status | Meaning |
|--------|---------|
| `DRAFT` | Cart / incomplete |
| `AWAITING_PAYMENT` | Placed; payment not verified |
| `PAYMENT_REVIEW` | Manual proof under admin review |
| `PAID` | Payment verified server-side |
| `PROCESSING` | Fulfillment started |
| `PARTIALLY_FULFILLED` | Some lines delivered |
| `FULFILLED` | All lines delivered |
| `COMPLETED` | Customer confirmed / closed |
| `CANCELLED` | Cancelled before completion |
| `REFUND_PENDING` | Refund in progress |
| `REFUNDED` | Refunded |
| `DISPUTED` | Dispute open |
| `EXPIRED` | Unpaid window expired |

### Allowed transitions (summary)

```
DRAFT → AWAITING_PAYMENT | CANCELLED | EXPIRED
AWAITING_PAYMENT → PAYMENT_REVIEW | PAID | CANCELLED | EXPIRED
PAYMENT_REVIEW → PAID | AWAITING_PAYMENT | CANCELLED | EXPIRED
PAID → PROCESSING | REFUND_PENDING | DISPUTED | CANCELLED
PROCESSING → PARTIALLY_FULFILLED | FULFILLED | REFUND_PENDING | DISPUTED
… → COMPLETED | REFUNDED (terminal paths)
```

Use `canTransitionOrder()` / `assertOrderTransition()` before updates.

## Payment status (parallel track)

| Status | Meaning |
|--------|---------|
| `UNPAID` | No proof or gateway attempt |
| `PENDING` | Gateway initiated (if used) |
| `UNDER_REVIEW` | Manual proof queued |
| `PAID` | Verified |
| `FAILED` | Failed / rejected proof |
| `CANCELLED` | Cancelled |
| `PARTIALLY_REFUNDED` / `REFUNDED` / `CHARGEBACK` | Post-sale |

Manual proof workflow: `SUBMITTED → UNDER_REVIEW → VERIFIED | REJECTED` (`src/lib/payments/manual.ts`).

## Fulfillment status

| Status | Meaning |
|--------|---------|
| `NOT_STARTED` | Awaiting paid order |
| `QUEUED` | In queue |
| `NEEDS_CUSTOMER_INFO` | Missing activation email/details |
| `IN_PROGRESS` | Staff working |
| `DELIVERED` | Delivery recorded |
| `CUSTOMER_CONFIRMED` | Customer acknowledged |
| `FAILED` / `REPLACEMENT_REQUIRED` / `CANCELLED` | Exception paths |

## Fulfillment gate

```typescript
canFulfillOrder({ orderStatus, paymentStatus })
// paymentStatus must be PAID
// orderStatus ∈ PAID | PROCESSING | PARTIALLY_FULFILLED
```

**UNPAID orders cannot be fulfilled.**

## Checkout flow (current build)

1. Customer submits checkout → `POST /api/checkout`
2. `createOrder()` validates phone, compliance (`evaluatePublication`), recomputes prices
3. Order saved to in-memory store with `secureToken` and human-readable number (`THX-…`)
4. Status: `AWAITING_PAYMENT`, payment `UNPAID` (manual methods)
5. Customer uploads proof via API or coordinates via WhatsApp (proof still needs admin verify)
6. Admin verifies → transitions to `PAID` → fulfillment queue

Persistence to PostgreSQL is TODO when `DATABASE_URL` is configured.

## Public timeline

`getPublicOrderTimeline()` in `order-store.ts` exposes safe messages only (order number, payment state). No internal IDs or costs.

## Audit

Order creation logs `ORDER_CREATED` via `appendAuditEvent()`.
