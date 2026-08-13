import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const appRoleEnum = pgEnum("app_role", [
  "GUEST",
  "CUSTOMER",
  "SUPPORT",
  "FULFILLMENT",
  "CATALOG_MANAGER",
  "FINANCE",
  "COMPLIANCE_REVIEWER",
  "ADMIN",
  "SUPER_ADMIN",
]);

export const accountStatusEnum = pgEnum("account_status", [
  "ACTIVE",
  "SUSPENDED",
  "PENDING_VERIFICATION",
  "DEACTIVATED",
]);

export const complianceStatusEnum = pgEnum("compliance_status", [
  "UNREVIEWED",
  "DOCUMENTS_REQUIRED",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
]);

export const supplyAuthTypeEnum = pgEnum("supply_authorization_type", [
  "AUTHORIZED_RESELLER",
  "OFFICIAL_TEAM_SEAT",
  "OFFICIAL_BUSINESS_SEAT",
  "OFFICIAL_REDEEM_CODE",
  "CUSTOMER_EMAIL_ACTIVATION",
  "API_POWERED_SERVICE",
  "OWN_DIGITAL_PRODUCT",
  "MANAGED_IMPLEMENTATION_SERVICE",
  "UNKNOWN",
]);

export const vendorProofStatusEnum = pgEnum("vendor_proof_status", [
  "NOT_UPLOADED",
  "PENDING_REVIEW",
  "VERIFIED",
  "EXPIRED",
  "REJECTED",
]);

export const productStatusEnum = pgEnum("product_status", [
  "DRAFT",
  "BLOCKED",
  "PUBLIC",
  "ARCHIVED",
]);

export const productTypeEnum = pgEnum("product_type", [
  "DIGITAL_LICENSE",
  "TEAM_SEAT",
  "REDEEM_CODE",
  "API_SERVICE",
  "OWNED_ASSET",
  "CONSULTATION",
  "MANAGED_SERVICE",
  "SUPPORT_PLAN",
]);

export const fulfillmentTypeEnum = pgEnum("fulfillment_type", [
  "MANUAL_CUSTOMER_EMAIL_ACTIVATION",
  "OFFICIAL_TEAM_INVITATION",
  "OFFICIAL_REDEEM_CODE",
  "API_POWERED_ACCESS",
  "DOWNLOADABLE_OWNED_ASSET",
  "MANAGED_SETUP_SERVICE",
  "CONSULTATION",
  "LICENSE_KEY_FROM_AUTHORIZED_DISTRIBUTOR",
]);

export const pricingModeEnum = pgEnum("pricing_mode", [
  "MANUAL_ONLY",
  "FORMULA_WITH_OVERRIDE",
  "FORMULA_ONLY",
]);

export const roundingModeEnum = pgEnum("rounding_mode", [
  "NEAREST_5",
  "NEAREST_10",
  "END_9",
  "END_49",
  "END_99",
  "NO_ROUNDING",
]);

export const durationUnitEnum = pgEnum("duration_unit", [
  "DAY",
  "WEEK",
  "MONTH",
  "YEAR",
  "CREDITS",
  "SESSION",
  "ONE_TIME",
]);

export const inventoryLotStatusEnum = pgEnum("inventory_lot_status", [
  "ACTIVE",
  "RECEIVED",
  "DEPLETED",
  "EXPIRED",
  "WRITTEN_OFF",
]);

export const inventoryMovementTypeEnum = pgEnum("inventory_movement_type", [
  "RECEIVE",
  "RESERVE",
  "RELEASE",
  "SELL",
  "RETURN",
  "WRITE_OFF",
  "CORRECTION",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "ACTIVE",
  "CONVERTED",
  "RELEASED",
  "EXPIRED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "DRAFT",
  "AWAITING_PAYMENT",
  "PAYMENT_REVIEW",
  "PAID",
  "PROCESSING",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "COMPLETED",
  "CANCELLED",
  "REFUND_PENDING",
  "REFUNDED",
  "DISPUTED",
  "EXPIRED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "UNPAID",
  "PENDING",
  "UNDER_REVIEW",
  "PAID",
  "FAILED",
  "CANCELLED",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
  "CHARGEBACK",
]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "NOT_STARTED",
  "QUEUED",
  "NEEDS_CUSTOMER_INFO",
  "IN_PROGRESS",
  "DELIVERED",
  "CUSTOMER_CONFIRMED",
  "FAILED",
  "REPLACEMENT_REQUIRED",
  "CANCELLED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "ESEWA_MANUAL",
  "KHALTI_MANUAL",
  "BANK_TRANSFER",
  "ESEWA_GATEWAY",
  "KHALTI_GATEWAY",
  "FONEPAY_PLACEHOLDER",
  "CONNECTIPS_PLACEHOLDER",
]);

export const manualPaymentStatusEnum = pgEnum("manual_payment_status", [
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
]);

export const currencyEnum = pgEnum("currency_code", ["NPR", "USD"]);

// ─── Profiles ────────────────────────────────────────────────────────────────

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authUserId: uuid("auth_user_id").notNull().unique(),
    fullName: text("full_name"),
    email: text("email").notNull(),
    phone: text("phone"),
    locale: text("locale").notNull().default("en-NP"),
    role: appRoleEnum("role").notNull().default("CUSTOMER"),
    accountStatus: accountStatusEnum("account_status").notNull().default("ACTIVE"),
    mfaEnabled: boolean("mfa_enabled").notNull().default(false),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("profiles_email_idx").on(t.email),
    index("profiles_role_idx").on(t.role),
  ],
);

// ─── Business settings ───────────────────────────────────────────────────────

export const businessSettings = pgTable("business_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull().default("TRIHEX DIGITAL"),
  registrationAuthority: text("registration_authority"),
  registrationNumber: text("registration_number"),
  registeredAddress: text("registered_address"),
  pan: text("pan"),
  vatNumber: text("vat_number"),
  ecommerceListingNumber: text("ecommerce_listing_number"),
  ecommerceListingStatus: text("ecommerce_listing_status"),
  customerServiceEmail: text("customer_service_email"),
  customerServicePhone: text("customer_service_phone"),
  grievanceOfficerName: text("grievance_officer_name"),
  grievanceEmail: text("grievance_email"),
  grievancePhone: text("grievance_phone"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),
  defaultCurrency: currencyEnum("default_currency").notNull().default("NPR"),
  timezone: text("timezone").notNull().default("Asia/Kathmandu"),
  invoicePrefix: text("invoice_prefix").notNull().default("THX"),
  announcementBarText: text("announcement_bar_text"),
  announcementBarActive: boolean("announcement_bar_active").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Catalogue taxonomy ──────────────────────────────────────────────────────

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    isOwnBrand: boolean("is_own_brand").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    parentId: uuid("parent_id"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
);

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

// ─── Products ────────────────────────────────────────────────────────────────

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").references(() => brands.id),
    categoryId: uuid("category_id").references(() => categories.id),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    shortDescription: text("short_description"),
    longDescription: text("long_description"),
    sourceListingText: text("source_listing_text"),
    productType: productTypeEnum("product_type").notNull(),
    fulfillmentType: fulfillmentTypeEnum("fulfillment_type").notNull(),
    productStatus: productStatusEnum("product_status").notNull().default("DRAFT"),
    complianceStatus: complianceStatusEnum("compliance_status")
      .notNull()
      .default("UNREVIEWED"),
    supplyAuthorizationType: supplyAuthTypeEnum("supply_authorization_type")
      .notNull()
      .default("UNKNOWN"),
    vendorProofStatus: vendorProofStatusEnum("vendor_proof_status")
      .notNull()
      .default("NOT_UPLOADED"),
    authorizationDocumentUrl: text("authorization_document_url"),
    authorizationReference: text("authorization_reference"),
    supplierInvoiceReference: text("supplier_invoice_reference"),
    proofExpiryDate: timestamp("proof_expiry_date", { withTimezone: true }),
    complianceNotes: text("compliance_notes"),
    reviewedByAdminId: uuid("reviewed_by_admin_id").references(() => profiles.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    lastTermsReviewAt: timestamp("last_terms_review_at", { withTimezone: true }),
    nextTermsReviewAt: timestamp("next_terms_review_at", { withTimezone: true }),
    featured: boolean("featured").notNull().default(false),
    searchable: boolean("searchable").notNull().default(true),
    needsDataVerification: boolean("needs_data_verification").notNull().default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    trademarkDisclaimer: text("trademark_disclaimer"),
    customerRequirements: text("customer_requirements"),
    deliveryEstimateMinMinutes: integer("delivery_estimate_min_minutes"),
    deliveryEstimateMaxMinutes: integer("delivery_estimate_max_minutes"),
    cancellationAllowedBeforeFulfillment: boolean(
      "cancellation_allowed_before_fulfillment",
    )
      .notNull()
      .default(true),
    returnability: text("returnability"),
    supportNotes: text("support_notes"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    blockedReason: text("blocked_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_status_idx").on(t.productStatus),
    index("products_compliance_idx").on(t.complianceStatus),
    index("products_category_idx").on(t.categoryId),
    index("products_brand_idx").on(t.brandId),
    // DB-level publication gate: PUBLIC requires APPROVED compliance
    check(
      "products_public_requires_approved",
      sql`(product_status != 'PUBLIC') OR (compliance_status = 'APPROVED')`,
    ),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    variantName: text("variant_name").notNull(),
    durationValue: integer("duration_value"),
    durationUnit: durationUnitEnum("duration_unit"),
    warrantyValue: integer("warranty_value"),
    warrantyUnit: durationUnitEnum("warranty_unit"),
    warrantyCoverage: text("warranty_coverage"),
    activationMethod: text("activation_method"),
    region: text("region").default("GLOBAL"),
    eligibilityRules: jsonb("eligibility_rules").$type<Record<string, unknown>>().default({}),
    supplierCurrency: currencyEnum("supplier_currency").notNull().default("USD"),
    supplierCostMinor: integer("supplier_cost_minor").notNull().default(0),
    supplierCostUsdMinor: integer("supplier_cost_usd_minor"),
    manualSellingPriceNprMinor: integer("manual_selling_price_npr_minor"),
    computedSellingPriceNprMinor: integer("computed_selling_price_npr_minor"),
    compareAtPriceNprMinor: integer("compare_at_price_npr_minor"),
    minimumProfitNprMinor: integer("minimum_profit_npr_minor").notNull().default(0),
    targetMarginBasisPoints: integer("target_margin_basis_points").notNull().default(2000),
    riskReserveBasisPoints: integer("risk_reserve_basis_points").notNull().default(500),
    gatewayFeeBasisPoints: integer("gateway_fee_basis_points").notNull().default(200),
    fixedOperationalCostNprMinor: integer("fixed_operational_cost_npr_minor")
      .notNull()
      .default(0),
    fxRateSnapshot: integer("fx_rate_snapshot"),
    pricingMode: pricingModeEnum("pricing_mode").notNull().default("FORMULA_WITH_OVERRIDE"),
    roundingMode: roundingModeEnum("rounding_mode").notNull().default("NEAREST_10"),
    active: boolean("active").notNull().default(true),
    purchasable: boolean("purchasable").notNull().default(false),
    maxPerCustomer: integer("max_per_customer"),
    lowStockThreshold: integer("low_stock_threshold").notNull().default(3),
    seedVisibleQuantity: integer("seed_visible_quantity"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("variants_product_idx").on(t.productId),
    check("variants_cost_nonneg", sql`supplier_cost_minor >= 0`),
    check(
      "variants_purchasable_requires_price",
      sql`(purchasable = false) OR (computed_selling_price_npr_minor IS NOT NULL OR manual_selling_price_npr_minor IS NOT NULL)`,
    ),
  ],
);

export const productTags = pgTable(
  "product_tags",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("product_tags_uq").on(t.productId, t.tagId)],
);

export const productMedia = pgTable("product_media", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
});

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactEmail: text("contact_email"),
  notes: text("notes"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supplierProducts = pgTable("supplier_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id),
  supplierSku: text("supplier_sku"),
  notes: text("notes"),
});

export const supplierCostHistory = pgTable("supplier_cost_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  costMinor: integer("cost_minor").notNull(),
  currency: currencyEnum("currency").notNull(),
  recordedBy: uuid("recorded_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supplierAuthorizations = pgTable("supplier_authorizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  productId: uuid("product_id").references(() => products.id),
  documentStoragePath: text("document_storage_path").notNull(),
  reference: text("reference"),
  status: vendorProofStatusEnum("status").notNull().default("PENDING_REVIEW"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  uploadedBy: uuid("uploaded_by").references(() => profiles.id),
  reviewedBy: uuid("reviewed_by").references(() => profiles.id),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Inventory ───────────────────────────────────────────────────────────────

export const inventoryLots = pgTable(
  "inventory_lots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    supplierId: uuid("supplier_id").references(() => suppliers.id),
    acquisitionReference: text("acquisition_reference"),
    quantityReceived: integer("quantity_received").notNull(),
    quantityAvailable: integer("quantity_available").notNull(),
    quantityReserved: integer("quantity_reserved").notNull().default(0),
    quantitySold: integer("quantity_sold").notNull().default(0),
    unitCostMinor: integer("unit_cost_minor").notNull(),
    costCurrency: currencyEnum("cost_currency").notNull().default("USD"),
    acquiredAt: timestamp("acquired_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    status: inventoryLotStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("lots_variant_idx").on(t.variantId),
    check("lots_available_nonneg", sql`quantity_available >= 0`),
    check("lots_reserved_nonneg", sql`quantity_reserved >= 0`),
    check("lots_sold_nonneg", sql`quantity_sold >= 0`),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    inventoryLotId: uuid("inventory_lot_id").references(() => inventoryLots.id),
    orderItemId: uuid("order_item_id"),
    type: inventoryMovementTypeEnum("type").notNull(),
    quantityDelta: integer("quantity_delta").notNull(),
    beforeQuantity: integer("before_quantity").notNull(),
    afterQuantity: integer("after_quantity").notNull(),
    reason: text("reason"),
    actorId: uuid("actor_id").references(() => profiles.id),
    idempotencyKey: text("idempotency_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("movements_idempotency_uq").on(t.idempotencyKey),
    index("movements_variant_idx").on(t.variantId),
  ],
);

export const stockReservations = pgTable(
  "stock_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    cartId: uuid("cart_id"),
    orderId: uuid("order_id"),
    quantity: integer("quantity").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    status: reservationStatusEnum("status").notNull().default("ACTIVE"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reservations_variant_idx").on(t.variantId),
    index("reservations_status_idx").on(t.status),
    check("reservations_qty_positive", sql`quantity > 0`),
  ],
);

// ─── Carts ───────────────────────────────────────────────────────────────────

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => profiles.id),
  sessionToken: text("session_token"),
  currency: currencyEnum("currency").notNull().default("NPR"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull().default(1),
    unitPriceSnapshotMinor: integer("unit_price_snapshot_minor"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("cart_items_uq").on(t.cartId, t.variantId)],
);

// ─── Customers ───────────────────────────────────────────────────────────────

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id)
    .unique(),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customerAddresses = pgTable("customer_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  label: text("label"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").notNull().default("NP"),
  isDefault: boolean("is_default").notNull().default(false),
});

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    humanReadableOrderNumber: text("human_readable_order_number").notNull().unique(),
    customerId: uuid("customer_id").references(() => profiles.id),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    customerName: text("customer_name"),
    subtotalMinor: integer("subtotal_minor").notNull(),
    discountMinor: integer("discount_minor").notNull().default(0),
    feeMinor: integer("fee_minor").notNull().default(0),
    taxMinor: integer("tax_minor").notNull().default(0),
    grandTotalMinor: integer("grand_total_minor").notNull(),
    currency: currencyEnum("currency").notNull().default("NPR"),
    orderStatus: orderStatusEnum("order_status").notNull().default("DRAFT"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("UNPAID"),
    fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status")
      .notNull()
      .default("NOT_STARTED"),
    complianceSnapshot: jsonb("compliance_snapshot").$type<Record<string, unknown>>(),
    termsVersion: text("terms_version"),
    privacyVersion: text("privacy_version"),
    customerIpHash: text("customer_ip_hash"),
    secureToken: text("secure_token").notNull().unique(),
    orderNotes: text("order_notes"),
    internalNotes: text("internal_notes"),
    /** Admin checklist — order not complete until WhatsApp delivered */
    fulfillmentActivated: boolean("fulfillment_activated").notNull().default(false),
    fulfillmentEmailSent: boolean("fulfillment_email_sent").notNull().default(false),
    fulfillmentWhatsappDelivered: boolean("fulfillment_whatsapp_delivered")
      .notNull()
      .default(false),
    fulfillmentNotes: text("fulfillment_notes"),
    fulfillmentDeliveredAt: timestamp("fulfillment_delivered_at", {
      withTimezone: true,
    }),
    marketingConsent: boolean("marketing_consent").notNull().default(false),
    couponCode: text("coupon_code"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    placedAt: timestamp("placed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("orders_status_idx").on(t.orderStatus),
    index("orders_payment_idx").on(t.paymentStatus),
    index("orders_email_idx").on(t.customerEmail),
    check("orders_totals_nonneg", sql`grand_total_minor >= 0 AND subtotal_minor >= 0`),
  ],
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  productName: text("product_name").notNull(),
  variantName: text("variant_name").notNull(),
  sku: text("sku").notNull(),
  quantity: integer("quantity").notNull(),
  unitPriceMinor: integer("unit_price_minor").notNull(),
  totalMinor: integer("total_minor").notNull(),
  supplierCostSnapshotMinor: integer("supplier_cost_snapshot_minor"),
  profitSnapshotMinor: integer("profit_snapshot_minor"),
  warrantySnapshot: jsonb("warranty_snapshot").$type<Record<string, unknown>>(),
  deliveryEstimateSnapshot: jsonb("delivery_estimate_snapshot").$type<Record<string, unknown>>(),
  fulfillmentTypeSnapshot: text("fulfillment_type_snapshot"),
  authorizationSnapshot: jsonb("authorization_snapshot").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  statusType: text("status_type").notNull(), // order | payment | fulfillment
  reason: text("reason"),
  actorId: uuid("actor_id").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Payments ────────────────────────────────────────────────────────────────

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    provider: text("provider"),
    providerReference: text("provider_reference"),
    amountMinor: integer("amount_minor").notNull(),
    status: paymentStatusEnum("status").notNull().default("PENDING"),
    rawCallbackHash: text("raw_callback_hash"),
    verifiedServerSide: boolean("verified_server_side").notNull().default(false),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    failureCode: text("failure_code"),
    idempotencyKey: text("idempotency_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("payments_idempotency_uq").on(t.idempotencyKey),
    index("payments_order_idx").on(t.orderId),
  ],
);

export const manualPaymentSubmissions = pgTable("manual_payment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  paymentId: uuid("payment_id").references(() => payments.id),
  method: paymentMethodEnum("method").notNull(),
  senderName: text("sender_name").notNull(),
  senderReference: text("sender_reference").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  proofImageUrl: text("proof_image_url"),
  /** SHA-256 of proof bytes — duplicate screenshot detection */
  proofContentHash: text("proof_content_hash"),
  status: manualPaymentStatusEnum("status").notNull().default("SUBMITTED"),
  reviewerId: uuid("reviewer_id").references(() => profiles.id),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Fulfillment ─────────────────────────────────────────────────────────────

export const fulfillments = pgTable("fulfillments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id),
  assignedTo: uuid("assigned_to").references(() => profiles.id),
  status: fulfillmentStatusEnum("status").notNull().default("NOT_STARTED"),
  customerAccountEmail: text("customer_account_email"),
  activationReference: text("activation_reference"),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  fulfillmentNotes: text("fulfillment_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const secureDeliveryMessages = pgTable("secure_delivery_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  fulfillmentId: uuid("fulfillment_id")
    .notNull()
    .references(() => fulfillments.id),
  encryptedPayload: text("encrypted_payload"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revealedAt: timestamp("revealed_at", { withTimezone: true }),
  revealCount: integer("reveal_count").notNull().default(0),
  maxReveals: integer("max_reveals").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const redeemCodes = pgTable(
  "redeem_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    inventoryLotId: uuid("inventory_lot_id").references(() => inventoryLots.id),
    encryptedCode: text("encrypted_code").notNull(),
    codeHash: text("code_hash").notNull(),
    assignedOrderItemId: uuid("assigned_order_item_id").references(() => orderItems.id),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    revealedAt: timestamp("revealed_at", { withTimezone: true }),
    status: text("status").notNull().default("AVAILABLE"), // AVAILABLE | ASSIGNED | REVEALED | REVOKED
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("redeem_codes_hash_uq").on(t.codeHash)],
);

// ─── Warranty / Refunds / Support ────────────────────────────────────────────

export const warrantyCases = pgTable("warranty_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id),
  customerId: uuid("customer_id").references(() => profiles.id),
  status: text("status").notNull().default("OPEN"),
  reason: text("reason").notNull(),
  resolution: text("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refunds = pgTable("refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  paymentId: uuid("payment_id").references(() => payments.id),
  amountMinor: integer("amount_minor").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("PENDING"),
  approvedBy: uuid("approved_by").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supportTickets = pgTable("support_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id").references(() => profiles.id),
  orderId: uuid("order_id").references(() => orders.id),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("NORMAL"),
  status: text("status").notNull().default("OPEN"),
  assignedTo: uuid("assigned_to").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const supportMessages = pgTable("support_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => supportTickets.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").references(() => profiles.id),
  body: text("body").notNull(),
  isInternal: boolean("is_internal").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").references(() => products.id),
  customerId: uuid("customer_id").references(() => profiles.id),
  orderId: uuid("order_id").references(() => orders.id),
  authorName: text("author_name"),
  categorySlug: text("category_slug"),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body"),
  status: text("status").notNull().default("PENDING"), // PENDING | APPROVED | REJECTED
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Promotions ──────────────────────────────────────────────────────────────

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // PERCENT | FIXED
  discountValue: integer("discount_value").notNull(),
  minOrderMinor: integer("min_order_minor"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  active: boolean("active").notNull().default(true),
  stackable: boolean("stackable").notNull().default(false),
  requiresSuperAdminBelowFloor: boolean("requires_super_admin_below_floor")
    .notNull()
    .default(true),
});

export const promotions = pgTable("promotions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(false),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
});

export const promotionProducts = pgTable("promotion_products", {
  promotionId: uuid("promotion_id")
    .notNull()
    .references(() => promotions.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
});

// ─── Notifications ───────────────────────────────────────────────────────────

export const notificationTemplates = pgTable("notification_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientEmail: text("recipient_email"),
  recipientProfileId: uuid("recipient_profile_id").references(() => profiles.id),
  templateKey: text("template_key"),
  subject: text("subject").notNull(),
  bodyPreview: text("body_preview"),
  status: text("status").notNull().default("PENDING"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Audit / Legal / FX / System ─────────────────────────────────────────────

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => profiles.id),
    actorRole: text("actor_role"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    beforeHash: text("before_hash"),
    afterHash: text("after_hash"),
    reason: text("reason"),
    ipHash: text("ip_hash"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_actor_idx").on(t.actorId),
  ],
);

export const legalDocuments = pgTable(
  "legal_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentType: text("document_type").notNull(),
    version: text("version").notNull(),
    title: text("title").notNull(),
    bodyMarkdown: text("body_markdown").notNull(),
    published: boolean("published").notNull().default(false),
    reviewedByLegal: boolean("reviewed_by_legal").notNull().default(false),
    effectiveAt: timestamp("effective_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("legal_docs_type_version_uq").on(t.documentType, t.version)],
);

export const legalAcceptances = pgTable("legal_acceptances", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id),
  profileId: uuid("profile_id").references(() => profiles.id),
  documentType: text("document_type").notNull(),
  documentVersion: text("document_version").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull().defaultNow(),
  ipHash: text("ip_hash"),
});

export const fxRates = pgTable("fx_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** NPR minor units per 1 USD */
  rateNprMinorPerUsd: integer("rate_npr_minor_per_usd").notNull(),
  source: text("source").notNull().default("MANUAL"),
  effectiveAt: timestamp("effective_at", { withTimezone: true }).notNull().defaultNow(),
  setBy: uuid("set_by").references(() => profiles.id),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pricingRules = pgTable("pricing_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  scope: text("scope").notNull().default("GLOBAL"), // GLOBAL | PRODUCT | VARIANT
  productId: uuid("product_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  roundingMode: roundingModeEnum("rounding_mode").notNull().default("NEAREST_10"),
  defaultMarginBasisPoints: integer("default_margin_basis_points").notNull().default(2000),
  defaultRiskBasisPoints: integer("default_risk_basis_points").notNull().default(500),
  defaultGatewayBasisPoints: integer("default_gateway_basis_points").notNull().default(200),
  defaultMinProfitNprMinor: integer("default_min_profit_npr_minor").notNull().default(0),
  durationRiskRules: jsonb("duration_risk_rules").$type<Record<string, number>>().default({}),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    externalEventId: text("external_event_id").notNull(),
    payloadHash: text("payload_hash").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    status: text("status").notNull().default("RECEIVED"),
    retryCount: integer("retry_count").notNull().default(0),
  },
  (t) => [uniqueIndex("webhook_provider_event_uq").on(t.provider, t.externalEventId)],
);

export const jobQueue = pgTable("job_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobType: text("job_type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  status: text("status").notNull().default("PENDING"),
  runAt: timestamp("run_at", { withTimezone: true }).notNull().defaultNow(),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const featureFlags = pgTable("feature_flags", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id)
    .unique(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  pdfStoragePath: text("pdf_storage_path"),
  snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
});
