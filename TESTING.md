# Testing

Test runner: **Vitest 4** with Node environment.

Config: `vitest.config.ts` — includes `src/**/*.test.ts` and `tests/**/*.test.ts`, `@/` alias to `src/`.

## Commands

```bash
# Single run (CI-friendly)
npm test

# Watch mode during development
npm run test:watch

# Typecheck + lint (recommended before commit)
npm run typecheck
npm run lint
```

## Test files

| File | Coverage |
|------|----------|
| `src/lib/money/money.test.ts` | Integer money, FX, rounding |
| `src/lib/pricing/contribution.test.ts` | Contribution labels, Gemini example |
| `src/lib/whatsapp/whatsapp.test.ts` | Number normalize, URL build, forbidden content |
| `tests/domain.test.ts` | Compliance gate, seed audit, order SM, RBAC, inventory concurrency |

## Notable domain tests

- 29 screenshot + 3 owned products; unique slugs/SKUs
- Screenshot products never PUBLIC
- Gemini 18m: NPR 300 manual price, not purchasable, `adReady: false`
- Concurrent reservation: only one succeeds when qty = 1
- SUPPORT cannot `payments:review`; FINANCE can
- Unpaid orders cannot fulfill

## Playwright

`@playwright/test` is in devDependencies but **no E2E suite is committed** in v0.1.0. Browser tests are future work.

## CI suggestion

```bash
npm run typecheck && npm run lint && npm test
```

## Writing new tests

- Prefer pure function tests in `src/lib/**`
- Use `resetInMemoryInventory()` between inventory tests
- Do not require `DATABASE_URL` for unit tests
