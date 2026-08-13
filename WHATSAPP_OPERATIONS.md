# WhatsApp Operations

TRIHEX DIGITAL uses WhatsApp for **customer communication only** — enquiries, payment coordination, and support. It is **not** a payment processor, order database, or fulfillment vault.

## Business number

| Format | Value |
|--------|-------|
| Display | **+977 9702910130** |
| wa.me / API | **9779702910130** |
| Env vars | `NEXT_PUBLIC_BUSINESS_WHATSAPP_NUMBER`, `NEXT_PUBLIC_BUSINESS_WHATSAPP_DISPLAY` |

Defaults and normalization: `src/lib/whatsapp/index.ts` (`normalizeWhatsAppNumber` adds `977` prefix for 10-digit Nepali mobiles).

## What WhatsApp is for

- Product questions before purchase
- Order status enquiries (after customer cites **order number**)
- Payment **coordination** ("I will send proof here")
- Delivery scheduling for consultations/services
- Post-sale support handoff

## What WhatsApp is NOT for

- Confirming payment without admin verify on website
- Sending or receiving **passwords**, shared account credentials, or OTPs
- Sending **license keys**, redeem codes, or supplier costs
- Sharing internal database UUIDs
- Replacing the authoritative order timeline on the website

The link builder **throws** if messages match forbidden patterns (password, OTP, license key, redeem code, supplier cost, bare UUIDs).

## Message templates (code-generated)

| Function | Use |
|----------|-----|
| `productEnquiryMessage` | Pre-purchase product question |
| `orderVerificationMessage` | After checkout — cites order number, NPR amount, method |
| `orderSupportMessage` | Post-order help — cites order number + website status |

Example verification text:

> Hello TRIHEX DIGITAL. I placed order THX-260721-123456 for NPR 300 using BANK_TRANSFER. I would like payment verification. I will send the payment proof in this conversation.

Links: `buildWhatsAppUrl()` → `https://wa.me/9779702910130?text=…`

## Storefront integration

- Floating button: `src/components/layout/whatsapp-floating.tsx`
- Product and checkout pages can deep-link with safe templates
- Settings UI: `/admin/settings/whatsapp`

## Staff operating procedures

### 1. Inbound enquiry

1. Greet with business name
2. Ask for product name or order number
3. Do **not** quote supplier cost or internal margin
4. Link to website for purchase when product is PUBLIC

### 2. Payment proof via chat

1. Ask for **order number** (`THX-…`)
2. Ask customer to also upload via website if possible
3. Forward to finance queue — do not reply "payment confirmed" until admin verifies
4. Reply: *"Received — our team will verify against our records and update your order on the website."*

### 3. Fulfillment updates

1. Confirm payment shows **PAID** on admin before promising delivery
2. Use permitted fulfillment type only (see [FULFILLMENT.md](./FULFILLMENT.md))
3. Never send third-party account passwords

### 4. Escalation

- Compliance / authorization questions → compliance reviewer
- Refunds → finance
- Technical failures → fulfillment lead

## Quick replies (copy-paste)

**General support**

> Namaste — TRIHEX DIGITAL here. Please share your order number (starts with THX-) or the product name. Website status is always at trihex.digital/track-order.

**Payment received — pending verify**

> Thank you. We received your message. Payment is confirmed only after our team verifies it in our system. You'll see "Paid" on your order tracking page when complete — usually within a few hours during business hours.

**Cannot help with blocked product**

> This product is not available for sale yet while we verify authorization. We don't sell shared passwords or unauthorized resold accounts.

**Wrong amount**

> The amount on your transfer doesn't match order total NPR {amount}. Please send the difference or contact us to adjust before we can verify.

**Outside business hours**

> Thanks for messaging TRIHEX DIGITAL. We're offline now and will reply next business day (Asia/Kathmandu). Your order status on the website is always up to date.

## Privacy

- Minimize PII in chat retention
- Do not paste full bank statements into group chats
- See [DATA_RETENTION.md](./DATA_RETENTION.md)

## Tests

`src/lib/whatsapp/whatsapp.test.ts` — number normalization, URL encoding, forbidden content rejection.
