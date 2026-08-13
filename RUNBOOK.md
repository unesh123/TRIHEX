# Runbook

Daily and weekly operations for TRIHEX DIGITAL (recovery build). Adjust when production DB and staffing are live.

## Daily checks

| Task | How |
|------|-----|
| App health | `GET /api/health` — expect `status: ok` |
| Payment review queue | `/admin/payments/review` — clear SUBMITTED/UNDER_REVIEW |
| Fulfillment queue | `/admin/fulfillment` — PAID orders not delivered |
| WhatsApp backlog | Business phone +977 9702910130 — respond within SLA |
| Expired reservations | Cron `release-reservations` (requires `CRON_SECRET`) |

## Order pipeline (happy path)

1. Customer checkout → `AWAITING_PAYMENT`
2. Customer pays + submits proof
3. Finance verifies → `PAID`
4. Fulfillment activates → `DELIVERED`
5. Customer confirms → `COMPLETED`

Website timeline is customer-facing source of truth.

## Weekly checks

| Task | Owner |
|------|-------|
| Compliance expiry review | Compliance reviewer — vendor proof dates |
| FX rate update | Admin — `/admin/fx-rates` if USD costs drift |
| Low stock review | Catalog — variants at `LOW_STOCK` |
| Audit sample | Admin — `/admin/audit` for unusual actions |
| Dependency updates | Dev — `npm audit`, patch Next.js security |

## Cron jobs

| Job | Route | Schedule (suggested) |
|-----|-------|----------------------|
| Release expired reservations | `/api/cron/release-reservations` | Every 15 min |

Header: `Authorization: Bearer ${CRON_SECRET}`

## Local development

```bash
cp .env.example .env.local
# ADMIN_DEV_BYPASS=true for admin UI
npm run dev
```

Demo mode: no `DATABASE_URL` — data resets on restart.

## Database operations (when connected)

```bash
npm run db:studio    # inspect data
npm run seed         # seed catalogue (after seed.ts wired to DB)
```

Never run `db:migrate` on production without backup + checklist.

## Key contacts

- WhatsApp support: +977 9702910130
- Grievance officer: configure in business settings / `/grievance` page

## Related docs

- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- [WHATSAPP_OPERATIONS.md](./WHATSAPP_OPERATIONS.md)
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
