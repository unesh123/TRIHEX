import { assertCheckoutAllowed } from "./availability";
import type { ProductVariantContract } from "./catalogue-contract";

export interface CartSelection {
  sku?: string;
  variantId?: string;
  quantity: number;
  observedPriceVersion?: number;
  observedUnitPriceNpr?: number;
  clientPriceNprMinor?: number;
}

export interface ValidatedLine {
  variant?: ProductVariantContract;
  sku: string;
  quantity: number;
  unitPriceNpr: number;
  unitPriceNprMinor: number;
  changed: boolean;
  changeReason?: string;
  error?: string;
}

export interface CartRevalidationResult {
  valid: boolean;
  hasPriceDrift: boolean;
  hasAvailabilityIssue: boolean;
  subtotalNprMinor: number;
  totalNpr: number;
  hasChanges: boolean;
  warnings: string[];
  lines: ValidatedLine[];
}

export type VariantSource =
  | ((id: string) => Promise<ProductVariantContract | null>)
  | ProductVariantContract[];

export async function revalidateCart(
  selections: CartSelection[],
  source: VariantSource,
): Promise<CartRevalidationResult> {
  const lines: ValidatedLine[] = [];
  const warnings: string[] = [];
  let hasPriceDrift = false;
  let hasAvailabilityIssue = false;
  let totalNpr = 0;
  let subtotalNprMinor = 0;

  const getVariant = async (id: string): Promise<ProductVariantContract | null> => {
    if (Array.isArray(source)) {
      return source.find((v) => v.sku === id || v.variantId === id || v.slug === id) ?? null;
    }
    return source(id);
  };

  for (const item of selections) {
    const lookupId = item.sku || item.variantId || "";
    const variant = await getVariant(lookupId);

    if (!variant) {
      hasAvailabilityIssue = true;
      lines.push({
        sku: lookupId,
        quantity: item.quantity,
        unitPriceNpr: 0,
        unitPriceNprMinor: 0,
        changed: true,
        error: "A selected plan is no longer available in our catalogue.",
      });
      continue;
    }

    let lineError: string | undefined;
    try {
      assertCheckoutAllowed(variant);
    } catch (err: unknown) {
      hasAvailabilityIssue = true;
      lineError = err instanceof Error ? err.message : "Plan unavailable";
    }

    const authoritativePriceMinor =
      variant.sellPriceNprMinor ?? (variant.sellPriceNpr ? variant.sellPriceNpr * 100 : 0);
    const authoritativePriceNpr =
      variant.sellPriceNpr ?? Math.round(authoritativePriceMinor / 100);

    let changed = false;
    let changeReason: string | undefined;

    const clientPriceMinor =
      item.clientPriceNprMinor ??
      (item.observedUnitPriceNpr != null ? item.observedUnitPriceNpr * 100 : undefined);

    if (
      clientPriceMinor != null &&
      clientPriceMinor !== authoritativePriceMinor
    ) {
      changed = true;
      hasPriceDrift = true;
      changeReason = `Price updated from Rs. ${Math.round(clientPriceMinor / 100)} to Rs. ${authoritativePriceNpr}`;
      warnings.push(`The price for ${variant.variantName ?? variant.sku} was updated.`);
    } else if (
      item.observedPriceVersion != null &&
      variant.priceVersion !== item.observedPriceVersion
    ) {
      changed = true;
      hasPriceDrift = true;
      changeReason = "Price version changed";
      warnings.push(`The price version for ${variant.sku} was updated.`);
    }

    const lineTotalMinor = authoritativePriceMinor * item.quantity;
    subtotalNprMinor += lineTotalMinor;
    totalNpr += Math.round(lineTotalMinor / 100);

    lines.push({
      variant,
      sku: variant.sku,
      quantity: item.quantity,
      unitPriceNpr: authoritativePriceNpr,
      unitPriceNprMinor: authoritativePriceMinor,
      changed,
      changeReason,
      error: lineError,
    });
  }

  const valid = !hasAvailabilityIssue && !hasPriceDrift && lines.every((l) => !l.error);

  return {
    valid,
    hasPriceDrift,
    hasAvailabilityIssue,
    subtotalNprMinor,
    totalNpr,
    hasChanges: hasPriceDrift || lines.some((l) => l.changed),
    warnings,
    lines,
  };
}
