# Pricing Engine

All monetary values use **integer minor units**. NPR is stored as paisa (1 NPR = 100 paisa). USD supplier costs use cents. **Never use floating-point for money.**

Implementation: `src/lib/pricing/engine.ts`, `src/lib/money/index.ts`, `src/lib/pricing/contribution.ts`.

## Pricing modes

| Mode | Behavior |
|------|----------|
| `MANUAL_ONLY` | Requires `manualSellingPriceNprMinor`; formula ignored for final price |
| `FORMULA_WITH_OVERRIDE` | Formula computed; manual price used if set |
| `FORMULA_ONLY` | Formula + psychological rounding only |

Schema default on variants: `FORMULA_WITH_OVERRIDE`. Seed example (Gemini 18m): `MANUAL_ONLY`.

## Formula (when not manual-only)

```
landedCost = supplierCostConverted
           + gatewayFeeEstimate
           + fixedOperationalCost
           + warrantyReserve
           + riskReserve

candidateByProfit = landedCost + minimumProfit
candidateByMargin = ceil(landedCost / (1 - targetMarginRate))
preRound = max(candidateByProfit, candidateByMargin)
finalPrice = psychologicalRound(preRound)   // or manual override
```

- FX: `convertUsdToNpr(usdCents, rateNprMinorPerUsd)` — rate is NPR minor per 1 USD (e.g. 160 NPR/USD → `16000`).
- Gateway and risk reserves use **basis points** (10000 = 100%).
- Rounding modes: `NEAREST_5`, `NEAREST_10`, `END_9`, `END_49`, `END_99`, `NO_ROUNDING`.

## Contribution labels (not guaranteed profit)

`calculateContribution()` in `src/lib/pricing/contribution.ts` subtracts allowances from gross difference:

| Label | Condition |
|-------|-----------|
| `HEALTHY` | Estimated contribution ≥ low-margin threshold (default NPR 50) and ≥ policy minimum |
| `LOW_MARGIN` | Above policy but below threshold |
| `BELOW_POLICY` | Below configured minimum policy |
| `ESTIMATED_LOSS` | Negative estimated contribution |

Allowances: payment, advertising, operating, support, warranty, tax. UI must **never** label this "guaranteed profit."

## Canonical example: Gemini 18-month @ NPR 300

Defined in `GEMINI_18M_NPR300_EXAMPLE` (`contribution.ts`) and seed variant `GEM-UPG-18M-001`:

| Field | Value |
|-------|-------|
| Supplier cost | USD 1.80 → `180` cents |
| FX rate | NPR 160/USD → `16000` minor per USD |
| Converted cost | NPR 288 → `28800` paisa |
| Manual sell price | NPR 300 → `30000` paisa |
| Gross difference | NPR 12 → `1200` paisa |
| Pricing mode | `MANUAL_ONLY` |
| Product status | `DRAFT` — **not purchasable or ad-ready** until compliance clears |

Owner note in seed: *"Owner-selected low launch price"*.

Checkout currently uses `FORMULA_ONLY` in `create-order.ts` for live cart lines; manual seed prices apply when admin/catalog wiring uses `MANUAL_ONLY` per variant.

## Admin

- Pricing calculator UI: `src/components/admin/pricing-calculator-panel.tsx`
- Contribution panel: `src/components/admin/contribution-panel.tsx`
- FX rates admin: `/admin/fx-rates`
- Variant fields: `supplier_cost_*`, margins, rounding, `manual_selling_price_npr_minor`

## Tests

- `src/lib/money/money.test.ts`
- `src/lib/pricing/contribution.test.ts`
- `tests/domain.test.ts` — Gemini 18m NPR 300 assertions
