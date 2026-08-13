# Payments

TRIHEX DIGITAL uses **manual QR / bank transfer** as the primary payment path in this build. Gateway integrations are stubbed for future use.

## Supported checkout methods

Active in checkout API (`src/app/api/checkout/route.ts`):

| Method | Description |
|--------|-------------|
| `ESEWA_MANUAL` | Customer pays via eSewa QR; uploads proof |
| `KHALTI_MANUAL` | Customer pays via Khalti QR; uploads proof |
| `BANK_TRANSFER` | Bank transfer; reference + proof |

Placeholder enum values exist for gateways (`ESEWA_GATEWAY`, `KHALTI_GATEWAY`, etc.) but are not the default checkout path.

## Manual payment flow

```
Customer places order (AWAITING_PAYMENT, UNPAID)
        ↓
Customer pays via QR / bank (off-site)
        ↓
Customer submits proof on website OR sends image via WhatsApp
        ↓
Status: SUBMITTED → UNDER_REVIEW
        ↓
Finance/admin reviews in /admin/payments/review
        ↓
VERIFIED → order payment PAID → fulfillment allowed
   or
REJECTED → customer notified, order stays unpaid
```

Implementation: `src/lib/payments/manual.ts`, in-memory store `src/lib/payments/store.ts`.

API: `POST /api/payments/manual` — requires `proofUrl` or `referenceCode`.

Admin review: `POST /api/payments/manual/review` (admin auth required).

## Critical rules

### Proof ≠ paid

Uploading a screenshot or sending WhatsApp proof **does not** mark an order paid. Only admin **VERIFIED** status (or verified gateway callback) transitions payment to `PAID`.

### WhatsApp ≠ paid

A WhatsApp message saying "I paid" is **coordination only**. Staff must:

1. Match message to **order number** (`THX-…`), not database UUID
2. Open admin payment review
3. Verify amount, sender, and reference against bank/eSewa/Khalti records
4. Click verify on the website

WhatsApp must not receive or relay full payment proofs containing unnecessary PII when the website upload is available.

## Amount validation

- Amounts in **NPR minor units** (integer paisa)
- Compare submitted amount to `grand_total_minor` on the order
- Reject mismatches or request top-up / partial payment policy per finance rules

## Security

- QR codes for display should be cropped/approved assets in admin (`/admin/payment-methods`) — not raw credentials
- Gateway secrets: `ESEWA_*`, `KHALTI_*` in env — never commit
- Audit events: `PAYMENT_SUBMITTED`, `PAYMENT_VERIFIED`, `PAYMENT_REJECTED`

## Demo mode

Without `DATABASE_URL`, manual payments live in an in-memory `Map` — lost on restart.

## Related

- [WHATSAPP_OPERATIONS.md](./WHATSAPP_OPERATIONS.md)
- [ORDER_LIFECYCLE.md](./ORDER_LIFECYCLE.md)
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
