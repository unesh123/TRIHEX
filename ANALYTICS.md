# Analytics

Analytics is **planned, not fully implemented** in v0.1.0. The codebase prepares hooks and env vars without shipping third-party scripts by default.

## Current state

| Item | Status |
|------|--------|
| `ANALYTICS_KEY` env var | Defined in `src/lib/env.ts` |
| Admin integrations copy | Mentions analytics connector (demo) |
| Client tracking SDK | Not bundled in storefront layout |
| Server-side event store | Schema has `webhook_events`; no product analytics table yet |

## Design principles (planned)

1. **Privacy-aware** — no PII in event payloads (hash emails/IPs with `IP_HASH_SALT`)
2. **Consent-gated** — respect `marketingConsent` from checkout
3. **Minimal collection** — page views, funnel steps, conversion, not keystroke logging
4. **Self-host or Nepal-appropriate vendors** — evaluate before production

## Planned event taxonomy

| Event | Trigger | Properties (non-PII) |
|-------|---------|----------------------|
| `page_view` | Route change | path, locale |
| `product_view` | Product detail | product_slug |
| `add_to_cart` | Cart add | product_slug, sku |
| `checkout_start` | Checkout page | cart_value_minor |
| `order_placed` | Checkout API success | order_number, total_minor, method |
| `payment_proof_submitted` | Manual payment API | method (no proof URL in analytics) |
| `payment_verified` | Admin verify | order_number (admin-side only) |

## Adapter pattern (planned)

```
src/lib/analytics/
  adapter.ts      # track(event, props) interface
  noop.ts         # default when ANALYTICS_KEY unset
  provider-*.ts   # optional vendor implementation
```

Default adapter: **no-op** in development and when key absent — avoids accidental data leakage.

## Admin reporting

`/admin/reports` — operational exports (demo until DB connected). Finance reports require `reports:profit` permission.

## Compliance

- Update `/privacy` when analytics goes live
- Cookie banner if non-essential cookies added
- Do not send supplier costs or margins to client-side analytics

## Related

- [SECURITY.md](./SECURITY.md) — `IP_HASH_SALT`
- [MARKETING.md](./MARKETING.md) — campaign measurement
