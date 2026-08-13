# Customer Support

TRIHEX DIGITAL support channels for the recovery build (v0.1.0).

## Contact

| Channel | Details |
|---------|---------|
| WhatsApp | [+977 9702910130](https://wa.me/9779702910130) — primary for Nepal |
| Website | `/contact`, `/faq`, `/account/support` |
| Order tracking | `/track-order` — requires order number + email |

Business hours: align with `Asia/Kathmandu` (configure in business settings when DB live).

## Principles

1. **Website status wins** — cite order tracking, not chat memory
2. **Never request passwords** — collect customer email for activation only
3. **Payment proof ≠ paid** — set expectation for verification time
4. **No false promises** on blocked or draft products

## Common scenarios

### "Where is my order?"

1. Ask for order number (`THX-…`) and email used at checkout
2. Direct to `/track-order`
3. Explain status: Awaiting payment → Payment review → Processing → Delivered
4. If paid but not fulfilled, check admin fulfillment queue (internal)

### "I paid on eSewa/Khalti"

1. Confirm order number and amount
2. Ask if proof uploaded on checkout page
3. If WhatsApp proof only: log for finance review — do not confirm payment in chat
4. Typical SLA message: verification within business hours

### "Product not on website"

- Likely `BLOCKED` or `DRAFT` pending compliance — do not sell via chat off-catalog
- Offer TRIHEX-owned PUBLIC alternatives if relevant

### "Account stopped working"

1. Confirm fulfillment type and warranty snapshot on order
2. Open warranty case (`/admin/warranties`) when DB live
3. Do not share replacement credentials in WhatsApp

### Refunds

Follow `/refund-policy` storefront page. Finance approval required — support cannot promise refund before review.

## Escalation matrix

| Issue | Escalate to |
|-------|-------------|
| Payment mismatch | Finance |
| Authorization / legality | Compliance reviewer |
| Delivery failure | Fulfillment |
| Abuse / fraud | Admin + audit log |

## Tools

- WhatsApp templates: [WHATSAPP_OPERATIONS.md](./WHATSAPP_OPERATIONS.md)
- Grievance page: `/grievance` (storefront)
- Admin support queue: `/admin/support` (demo shell)

## Privacy

Collect minimum PII. Do not paste full payment proofs into public channels. See [DATA_RETENTION.md](./DATA_RETENTION.md).
