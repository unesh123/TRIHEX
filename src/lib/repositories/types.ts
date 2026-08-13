import type { CreatedOrder } from "@/lib/checkout/create-order";
import type { ManualPaymentRecord } from "@/lib/payments/manual";
import type { AuditEvent, AuditAction } from "@/lib/audit/log";
import type { ReservationRecord } from "@/lib/inventory/reserve";

export interface BusinessSettingsRecord {
  businessName: string;
  tagline: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  customerServiceEmail: string | null;
  announcementBarText: string | null;
  announcementBarActive: boolean;
  ordersPaused: boolean;
  ordersPausedReason: string | null;
}

export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  productStatus: string;
  complianceStatus: string;
  purchasable: boolean;
}

export interface VariantPriceUpdate {
  variantId: string;
  manualSellingPriceNprMinor: number;
  pricingMode: string;
  fxRateSnapshot: number | null;
  paymentAllowanceNprMinor?: number;
  advertisingAllowanceNprMinor?: number;
  operatingAllowanceNprMinor?: number;
  supportAllowanceNprMinor?: number;
  warrantyAllowanceNprMinor?: number;
  taxAllowanceNprMinor?: number;
  overrideReason?: string;
  actorId: string;
}

export interface OrdersRepository {
  save(order: CreatedOrder): Promise<CreatedOrder & { secureToken: string }>;
  getByNumber(orderNumber: string): Promise<(CreatedOrder & { secureToken: string }) | null>;
  getBySecureToken(token: string): Promise<(CreatedOrder & { secureToken: string }) | null>;
  updatePaymentStatus(
    orderId: string,
    paymentStatus: string,
    orderStatus?: string,
  ): Promise<void>;
  listRecent(limit?: number): Promise<Array<CreatedOrder & { secureToken: string }>>;
}

export interface PaymentsRepository {
  submit(record: ManualPaymentRecord): Promise<ManualPaymentRecord>;
  get(id: string): Promise<ManualPaymentRecord | null>;
  list(): Promise<ManualPaymentRecord[]>;
  save(record: ManualPaymentRecord): Promise<ManualPaymentRecord>;
  findByReference(reference: string): Promise<ManualPaymentRecord[]>;
  findByProofHash?(hash: string): Promise<ManualPaymentRecord[]>;
}

export interface InventoryRepository {
  receive(input: {
    variantId: string;
    quantity: number;
    unitCostMinor: number;
    costCurrency: "USD" | "NPR";
    actorId?: string | null;
    reason?: string;
    idempotencyKey: string;
  }): Promise<{ lotId: string }>;
  reserve(input: {
    variantId: string;
    quantity: number;
    orderId?: string | null;
    actorId?: string | null;
    idempotencyKey: string;
  }): Promise<{ ok: true; reservation: ReservationRecord } | { ok: false; error: string }>;
  release(reservationId: string, actorId?: string | null): Promise<{ ok: boolean; error?: string }>;
  convertToSold(input: {
    reservationId: string;
    orderItemId?: string | null;
    actorId?: string | null;
    idempotencyKey: string;
  }): Promise<{ ok: boolean; error?: string }>;
  getAvailable(variantId: string): Promise<number>;
}

export interface AuditRepository {
  append(input: {
    action: AuditAction;
    actorId?: string | null;
    actorRole?: string | null;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
    ipHash?: string | null;
  }): Promise<AuditEvent>;
  recent(limit?: number): Promise<AuditEvent[]>;
}

export interface SettingsRepository {
  get(): Promise<BusinessSettingsRecord>;
  update(
    patch: Partial<BusinessSettingsRecord>,
    actorId: string,
  ): Promise<BusinessSettingsRecord>;
}

export interface PricingRepository {
  updateVariantPrice(input: VariantPriceUpdate): Promise<void>;
  getVariantPricing(variantId: string): Promise<{
    manualSellingPriceNprMinor: number | null;
    fxRateSnapshot: number | null;
    pricingMode: string;
  } | null>;
  listPriceHistory(variantId: string, limit?: number): Promise<
    Array<{
      id: string;
      manualSellingPriceNprMinor: number | null;
      overrideReason: string | null;
      createdAt: string;
    }>
  >;
}

export interface Repositories {
  mode: "postgres" | "demo" | "test";
  orders: OrdersRepository;
  payments: PaymentsRepository;
  inventory: InventoryRepository;
  audit: AuditRepository;
  settings: SettingsRepository;
  pricing: PricingRepository;
}
