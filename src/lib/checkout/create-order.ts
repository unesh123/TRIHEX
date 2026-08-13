import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";
import {
  evaluatePublication,
  type ComplianceStatus,
  type ProductStatus,
  type SupplyAuthorizationType,
  type VendorProofStatus,
} from "@/lib/compliance/gate";
import { calculatePrice, type PricingBreakdown } from "@/lib/pricing/engine";
import { appendAuditEvent } from "@/lib/audit/log";
import { generateOrderNumber, isValidNepaliPhone } from "@/lib/utils";
import { ALL_SEED_PRODUCTS } from "@/db/seed-data";
import { isDatabaseConfigured } from "@/lib/env";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { getRepositories } from "@/lib/repositories";
import { normalizeEnvAliases } from "@/lib/env/normalize-aliases";
import {
  applyWarrantyPrice,
  isWarrantyTier,
  parsePlanDaysFromLabel,
  warrantyOptionsForPlan,
} from "@/lib/catalog/warranty";

export type PaymentMethodPreference =
  | "ESEWA_MANUAL"
  | "KHALTI_MANUAL"
  | "BANK_TRANSFER"
  | "ESEWA_GATEWAY"
  | "KHALTI_GATEWAY";

export interface CheckoutLineInput {
  productSlug: string;
  variantSku: string;
  quantity: number;
  /** none = base price; protected = +30% with guarantee */
  warranty?: "none" | "protected";
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethodPreference;
  lines: CheckoutLineInput[];
  customerNotes?: string;
  /** Override FX for tests; defaults to operational FX when available */
  fxRateNprMinorPerUsd?: number;
  actorId?: string | null;
}

export interface OrderLineResult {
  productSlug: string;
  productName: string;
  variantSku: string;
  variantName: string;
  quantity: number;
  unitPriceNprMinor: number;
  lineTotalNprMinor: number;
  pricing: PricingBreakdown;
  variantId?: string | null;
  seedVisibleQuantity?: number | null;
  warrantyTier?: "none" | "protected";
  warrantyLabel?: string | null;
  warrantyGuaranteeDays?: number;
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethodPreference;
  lines: OrderLineResult[];
  subtotalNprMinor: number;
  totalNprMinor: number;
  currency: "NPR";
  createdAt: string;
  notes: string | null;
  fulfillmentActivated?: boolean;
  fulfillmentEmailSent?: boolean;
  fulfillmentWhatsappDelivered?: boolean;
  fulfillmentNotes?: string | null;
  fulfillmentDeliveredAt?: string | null;
  fulfillmentStatus?: string;
}

export type CreateOrderResult =
  | { ok: true; order: CreatedOrder & { secureToken: string } }
  | {
      ok: false;
      error: string;
      code: "VALIDATION" | "COMPLIANCE" | "PRICING" | "NOT_FOUND" | "STOCK";
    };

type ResolvedProduct = {
  slug: string;
  name: string;
  productStatus: string;
  complianceStatus: string;
  supplyAuthorizationType: string;
  vendorProofStatus: string;
  variant: {
    id: string | null;
    sku: string;
    variantName: string;
    supplierCostUsdMinor: number;
    manualSellingPriceNprMinor: number | null;
    minimumProfitNprMinor: number;
    fxRateNprMinorPerUsd: number | null;
    pricingMode: string;
    purchasable: boolean;
    /** null = unlimited storefront stock */
    seedVisibleQuantity: number | null;
    durationValue: number | null;
    durationUnit: string | null;
  };
};

async function resolveProductLine(
  productSlug: string,
  variantSku: string,
): Promise<ResolvedProduct | null> {
  normalizeEnvAliases();
  if (isDatabaseConfigured()) {
    const db = getDb();
    if (db) {
      const rows = await db
        .select({
          slug: schema.products.slug,
          name: schema.products.name,
          productStatus: schema.products.productStatus,
          complianceStatus: schema.products.complianceStatus,
          supplyAuthorizationType: schema.products.supplyAuthorizationType,
          vendorProofStatus: schema.products.vendorProofStatus,
          variantId: schema.productVariants.id,
          sku: schema.productVariants.sku,
          variantName: schema.productVariants.variantName,
          supplierCostUsdMinor: schema.productVariants.supplierCostUsdMinor,
          supplierCostMinor: schema.productVariants.supplierCostMinor,
          manualSellingPriceNprMinor:
            schema.productVariants.manualSellingPriceNprMinor,
          minimumProfitNprMinor: schema.productVariants.minimumProfitNprMinor,
          fxRateSnapshot: schema.productVariants.fxRateSnapshot,
          pricingMode: schema.productVariants.pricingMode,
          purchasable: schema.productVariants.purchasable,
          seedVisibleQuantity: schema.productVariants.seedVisibleQuantity,
          durationValue: schema.productVariants.durationValue,
          durationUnit: schema.productVariants.durationUnit,
          active: schema.productVariants.active,
        })
        .from(schema.products)
        .innerJoin(
          schema.productVariants,
          eq(schema.productVariants.productId, schema.products.id),
        )
        .where(
          and(
            eq(schema.products.slug, productSlug),
            eq(schema.productVariants.sku, variantSku),
          ),
        )
        .limit(1);
      const row = rows[0];
      if (!row || !row.active) return null;
      return {
        slug: row.slug,
        name: row.name,
        productStatus: row.productStatus,
        complianceStatus: row.complianceStatus,
        supplyAuthorizationType: row.supplyAuthorizationType,
        vendorProofStatus: row.vendorProofStatus,
        variant: {
          id: row.variantId,
          sku: row.sku,
          variantName: row.variantName,
          supplierCostUsdMinor:
            row.supplierCostUsdMinor ?? row.supplierCostMinor ?? 0,
          manualSellingPriceNprMinor: row.manualSellingPriceNprMinor,
          minimumProfitNprMinor: row.minimumProfitNprMinor ?? 0,
          fxRateNprMinorPerUsd: row.fxRateSnapshot,
          pricingMode: row.pricingMode,
          purchasable: row.purchasable,
          seedVisibleQuantity: row.seedVisibleQuantity,
          durationValue: row.durationValue,
          durationUnit: row.durationUnit,
        },
      };
    }
  }

  const product = ALL_SEED_PRODUCTS.find((p) => p.slug === productSlug);
  if (!product) return null;
  const variant = product.variants.find((v) => v.sku === variantSku);
  if (!variant) return null;
  return {
    slug: product.slug,
    name: product.name,
    productStatus: product.productStatus,
    complianceStatus: product.complianceStatus,
    supplyAuthorizationType: product.supplyAuthorizationType,
    vendorProofStatus: product.vendorProofStatus,
    variant: {
      id: null,
      sku: variant.sku,
      variantName: variant.variantName,
      supplierCostUsdMinor: variant.supplierCostUsdMinor,
      manualSellingPriceNprMinor: variant.manualSellingPriceNprMinor ?? null,
      minimumProfitNprMinor: variant.minimumProfitNprMinor ?? 20000,
      fxRateNprMinorPerUsd: variant.fxRateNprMinorPerUsd ?? null,
      pricingMode: variant.pricingMode ?? "FORMULA_ONLY",
      purchasable: variant.purchasable ?? product.productStatus === "PUBLIC",
      seedVisibleQuantity: variant.seedVisibleQuantity ?? null,
      durationValue: variant.durationValue,
      durationUnit: variant.durationUnit,
    },
  };
}

/**
 * Server-side order creation:
 * - validates Nepali phone
 * - rejects BLOCKED / non-purchasable products via evaluatePublication
 * - recomputes prices server-side (never trust client prices)
 * - persists via repositories when DATABASE_URL is configured
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  if (!input.customerName?.trim()) {
    return { ok: false, code: "VALIDATION", error: "Customer name is required." };
  }
  if (!input.customerEmail?.includes("@")) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "Valid customer email is required.",
    };
  }
  if (!isValidNepaliPhone(input.customerPhone)) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "Phone must be a valid Nepali mobile (98/97… or +977…).",
    };
  }
  if (!input.lines?.length) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "At least one line item is required.",
    };
  }

  const lines: OrderLineResult[] = [];

  for (const line of input.lines) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) {
      return {
        ok: false,
        code: "VALIDATION",
        error: `Invalid quantity for ${line.variantSku}.`,
      };
    }

    const product = await resolveProductLine(line.productSlug, line.variantSku);
    if (!product) {
      return {
        ok: false,
        code: "NOT_FOUND",
        error: `Product/variant not found: ${line.productSlug}/${line.variantSku}`,
      };
    }

    if (!product.variant.purchasable) {
      return {
        ok: false,
        code: "COMPLIANCE",
        error: `Product ${product.name} is not available for website checkout. Use Check Availability / WhatsApp.`,
      };
    }

    const stockQty = product.variant.seedVisibleQuantity;
    if (stockQty === 0) {
      return {
        ok: false,
        code: "STOCK",
        error: `${product.name} is out of stock.`,
      };
    }
    if (stockQty != null && stockQty > 0 && line.quantity > stockQty) {
      return {
        ok: false,
        code: "STOCK",
        error: `Only ${stockQty} left for ${product.name}. Reduce quantity and try again.`,
      };
    }

    if (product.productStatus === "BLOCKED") {
      return {
        ok: false,
        code: "COMPLIANCE",
        error: `Product ${product.name} is blocked and cannot be purchased.`,
      };
    }

    // Admin-enabled sell path: PUBLIC + APPROVED + purchasable (owner catalogue).
    // Avoid blocking checkout on UNKNOWN vendor-proof when Buy Now was intentionally enabled.
    const adminEnabledSell =
      product.productStatus === "PUBLIC" &&
      product.complianceStatus === "APPROVED" &&
      product.variant.purchasable;

    if (!adminEnabledSell) {
      const publication = evaluatePublication({
        complianceStatus: product.complianceStatus as ComplianceStatus,
        supplyAuthorizationType:
          product.supplyAuthorizationType as SupplyAuthorizationType,
        vendorProofStatus: product.vendorProofStatus as VendorProofStatus,
        proofExpiryDate: null,
        productStatus: product.productStatus as ProductStatus,
      });

      if (!publication.canPurchase) {
        return {
          ok: false,
          code: "COMPLIANCE",
          error:
            publication.reasons[0] ??
            `Product ${product.name} is not purchasable (under review or compliance).`,
        };
      }
    }

    const supplierCostMinor = product.variant.supplierCostUsdMinor;
    const supplierCurrency = supplierCostMinor > 0 ? "USD" : "NPR";
    const fxRateNprMinorPerUsd =
      input.fxRateNprMinorPerUsd ??
      product.variant.fxRateNprMinorPerUsd ??
      16000;
    const pricingMode =
      product.variant.manualSellingPriceNprMinor != null
        ? "MANUAL_ONLY"
        : (product.variant.pricingMode as
            | "MANUAL_ONLY"
            | "FORMULA_ONLY"
            | "FORMULA_WITH_OVERRIDE") || "FORMULA_ONLY";

    try {
      const pricing = calculatePrice({
        supplierCostMinor,
        supplierCurrency,
        fxRateNprMinorPerUsd,
        gatewayFeeBasisPoints: 200,
        fixedOperationalCostNprMinor: 0,
        riskReserveBasisPoints: 500,
        warrantyReserveNprMinor: 0,
        minimumProfitNprMinor: product.variant.minimumProfitNprMinor || 20000,
        targetMarginBasisPoints: 2000,
        roundingMode: "NEAREST_10",
        pricingMode,
        manualSellingPriceNprMinor:
          product.variant.manualSellingPriceNprMinor,
      });

      const baseUnit = pricing.finalPriceNprMinor;
      const warrantyTier = isWarrantyTier(line.warranty)
        ? line.warranty
        : "none";
      const planDays = (() => {
        const v = product.variant.durationValue;
        const u = product.variant.durationUnit;
        if (v == null || !u) return 30;
        if (u === "DAY") return v;
        if (u === "WEEK") return v * 7;
        if (u === "MONTH") return v * 30;
        if (u === "YEAR") return v * 365;
        return parsePlanDaysFromLabel(product.variant.variantName);
      })();
      const warrantyMeta = warrantyOptionsForPlan(planDays).find(
        (o) => o.tier === warrantyTier,
      );
      const unitPriceNprMinor = applyWarrantyPrice(baseUnit, warrantyTier);
      const warrantyLabel =
        warrantyTier === "protected"
          ? warrantyMeta?.guaranteeLabel ?? "Protected warranty"
          : "No warranty";

      lines.push({
        productSlug: product.slug,
        productName: product.name,
        variantSku: product.variant.sku,
        variantName:
          warrantyTier === "protected"
            ? `${product.variant.variantName} · ${warrantyLabel}`
            : `${product.variant.variantName} · No warranty`,
        quantity: line.quantity,
        unitPriceNprMinor,
        lineTotalNprMinor: unitPriceNprMinor * line.quantity,
        pricing,
        variantId: product.variant.id,
        seedVisibleQuantity: product.variant.seedVisibleQuantity,
        warrantyTier,
        warrantyLabel,
        warrantyGuaranteeDays: warrantyMeta?.guaranteeDays ?? 0,
      });
    } catch (err) {
      return {
        ok: false,
        code: "PRICING",
        error: err instanceof Error ? err.message : "Pricing failed.",
      };
    }
  }

  const subtotalNprMinor = lines.reduce((sum, l) => sum + l.lineTotalNprMinor, 0);
  const order: CreatedOrder = {
    id: crypto.randomUUID(),
    orderNumber: generateOrderNumber("THX"),
    status: "AWAITING_PAYMENT",
    paymentStatus: input.paymentMethod.includes("GATEWAY") ? "PENDING" : "UNPAID",
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    customerPhone: input.customerPhone.replace(/[\s-]/g, ""),
    paymentMethod: input.paymentMethod,
    lines,
    subtotalNprMinor,
    totalNprMinor: subtotalNprMinor,
    currency: "NPR",
    createdAt: new Date().toISOString(),
    notes: input.customerNotes?.trim() || null,
  };

  const repos = getRepositories();
  const saved = await repos.orders.save(order);

  await appendAuditEvent({
    action: "ORDER_CREATED",
    actorId: input.actorId,
    entityType: "order",
    entityId: saved.id,
    metadata: {
      orderNumber: saved.orderNumber,
      totalNprMinor: saved.totalNprMinor,
      lineCount: saved.lines.length,
      paymentMethod: saved.paymentMethod,
      persistence: repos.mode,
    },
  });

  return { ok: true, order: saved };
}
