CREATE TYPE "public"."account_status" AS ENUM('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION', 'DEACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."app_role" AS ENUM('GUEST', 'CUSTOMER', 'SUPPORT', 'FULFILLMENT', 'CATALOG_MANAGER', 'FINANCE', 'COMPLIANCE_REVIEWER', 'ADMIN', 'SUPER_ADMIN');--> statement-breakpoint
CREATE TYPE "public"."compliance_status" AS ENUM('UNREVIEWED', 'DOCUMENTS_REQUIRED', 'APPROVED', 'REJECTED', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."currency_code" AS ENUM('NPR', 'USD');--> statement-breakpoint
CREATE TYPE "public"."duration_unit" AS ENUM('DAY', 'WEEK', 'MONTH', 'YEAR', 'CREDITS', 'SESSION', 'ONE_TIME');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('NOT_STARTED', 'QUEUED', 'NEEDS_CUSTOMER_INFO', 'IN_PROGRESS', 'DELIVERED', 'CUSTOMER_CONFIRMED', 'FAILED', 'REPLACEMENT_REQUIRED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_type" AS ENUM('MANUAL_CUSTOMER_EMAIL_ACTIVATION', 'OFFICIAL_TEAM_INVITATION', 'OFFICIAL_REDEEM_CODE', 'API_POWERED_ACCESS', 'DOWNLOADABLE_OWNED_ASSET', 'MANAGED_SETUP_SERVICE', 'CONSULTATION', 'LICENSE_KEY_FROM_AUTHORIZED_DISTRIBUTOR');--> statement-breakpoint
CREATE TYPE "public"."inventory_lot_status" AS ENUM('ACTIVE', 'RECEIVED', 'DEPLETED', 'EXPIRED', 'WRITTEN_OFF');--> statement-breakpoint
CREATE TYPE "public"."inventory_movement_type" AS ENUM('RECEIVE', 'RESERVE', 'RELEASE', 'SELL', 'RETURN', 'WRITE_OFF', 'CORRECTION');--> statement-breakpoint
CREATE TYPE "public"."manual_payment_status" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('DRAFT', 'AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PAID', 'PROCESSING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'COMPLETED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'DISPUTED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('ESEWA_MANUAL', 'KHALTI_MANUAL', 'BANK_TRANSFER', 'ESEWA_GATEWAY', 'KHALTI_GATEWAY', 'FONEPAY_PLACEHOLDER', 'CONNECTIPS_PLACEHOLDER');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('UNPAID', 'PENDING', 'UNDER_REVIEW', 'PAID', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CHARGEBACK');--> statement-breakpoint
CREATE TYPE "public"."pricing_mode" AS ENUM('MANUAL_ONLY', 'FORMULA_WITH_OVERRIDE', 'FORMULA_ONLY');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('DRAFT', 'BLOCKED', 'PUBLIC', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('DIGITAL_LICENSE', 'TEAM_SEAT', 'REDEEM_CODE', 'API_SERVICE', 'OWNED_ASSET', 'CONSULTATION', 'MANAGED_SERVICE', 'SUPPORT_PLAN');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('ACTIVE', 'CONVERTED', 'RELEASED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."rounding_mode" AS ENUM('NEAREST_5', 'NEAREST_10', 'END_9', 'END_49', 'END_99', 'NO_ROUNDING');--> statement-breakpoint
CREATE TYPE "public"."supply_authorization_type" AS ENUM('AUTHORIZED_RESELLER', 'OFFICIAL_TEAM_SEAT', 'OFFICIAL_BUSINESS_SEAT', 'OFFICIAL_REDEEM_CODE', 'CUSTOMER_EMAIL_ACTIVATION', 'API_POWERED_SERVICE', 'OWN_DIGITAL_PRODUCT', 'MANAGED_IMPLEMENTATION_SERVICE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."vendor_proof_status" AS ENUM('NOT_UPLOADED', 'PENDING_REVIEW', 'VERIFIED', 'EXPIRED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_role" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"before_hash" text,
	"after_hash" text,
	"reason" text,
	"ip_hash" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo_url" text,
	"website_url" text,
	"is_own_brand" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_name" text DEFAULT 'TRIHEX DIGITAL' NOT NULL,
	"registration_authority" text,
	"registration_number" text,
	"registered_address" text,
	"pan" text,
	"vat_number" text,
	"ecommerce_listing_number" text,
	"ecommerce_listing_status" text,
	"customer_service_email" text,
	"customer_service_phone" text,
	"grievance_officer_name" text,
	"grievance_email" text,
	"grievance_phone" text,
	"social_links" jsonb DEFAULT '{}'::jsonb,
	"default_currency" "currency_code" DEFAULT 'NPR' NOT NULL,
	"timezone" text DEFAULT 'Asia/Kathmandu' NOT NULL,
	"invoice_prefix" text DEFAULT 'THX' NOT NULL,
	"announcement_bar_text" text,
	"announcement_bar_active" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_snapshot_minor" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"session_token" text,
	"currency" "currency_code" DEFAULT 'NPR' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"discount_type" text NOT NULL,
	"discount_value" integer NOT NULL,
	"min_order_minor" integer,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"active" boolean DEFAULT true NOT NULL,
	"stackable" boolean DEFAULT false NOT NULL,
	"requires_super_admin_below_floor" boolean DEFAULT true NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"label" text,
	"line1" text NOT NULL,
	"line2" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"country" text DEFAULT 'NP' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "fulfillments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"assigned_to" uuid,
	"status" "fulfillment_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"customer_account_email" text,
	"activation_reference" text,
	"delivered_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"fulfillment_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fx_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rate_npr_minor_per_usd" integer NOT NULL,
	"source" text DEFAULT 'MANUAL' NOT NULL,
	"effective_at" timestamp with time zone DEFAULT now() NOT NULL,
	"set_by" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_lots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"supplier_id" uuid,
	"acquisition_reference" text,
	"quantity_received" integer NOT NULL,
	"quantity_available" integer NOT NULL,
	"quantity_reserved" integer DEFAULT 0 NOT NULL,
	"quantity_sold" integer DEFAULT 0 NOT NULL,
	"unit_cost_minor" integer NOT NULL,
	"cost_currency" "currency_code" DEFAULT 'USD' NOT NULL,
	"acquired_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"status" "inventory_lot_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lots_available_nonneg" CHECK (quantity_available >= 0),
	CONSTRAINT "lots_reserved_nonneg" CHECK (quantity_reserved >= 0),
	CONSTRAINT "lots_sold_nonneg" CHECK (quantity_sold >= 0)
);
--> statement-breakpoint
CREATE TABLE "inventory_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"inventory_lot_id" uuid,
	"order_item_id" uuid,
	"type" "inventory_movement_type" NOT NULL,
	"quantity_delta" integer NOT NULL,
	"before_quantity" integer NOT NULL,
	"after_quantity" integer NOT NULL,
	"reason" text,
	"actor_id" uuid,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"invoice_number" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pdf_storage_path" text,
	"snapshot" jsonb NOT NULL,
	CONSTRAINT "invoices_order_id_unique" UNIQUE("order_id"),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "job_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"run_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_acceptances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid,
	"profile_id" uuid,
	"document_type" text NOT NULL,
	"document_version" text NOT NULL,
	"accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_hash" text
);
--> statement-breakpoint
CREATE TABLE "legal_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_type" text NOT NULL,
	"version" text NOT NULL,
	"title" text NOT NULL,
	"body_markdown" text NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"reviewed_by_legal" boolean DEFAULT false NOT NULL,
	"effective_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "manual_payment_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_id" uuid,
	"method" "payment_method" NOT NULL,
	"sender_name" text NOT NULL,
	"sender_reference" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"payment_date" timestamp with time zone,
	"proof_image_url" text,
	"status" "manual_payment_status" DEFAULT 'SUBMITTED' NOT NULL,
	"reviewer_id" uuid,
	"rejection_reason" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"subject" text NOT NULL,
	"body_html" text NOT NULL,
	"body_text" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_templates_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_email" text,
	"recipient_profile_id" uuid,
	"template_key" text,
	"subject" text NOT NULL,
	"body_preview" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid,
	"product_name" text NOT NULL,
	"variant_name" text NOT NULL,
	"sku" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_minor" integer NOT NULL,
	"total_minor" integer NOT NULL,
	"supplier_cost_snapshot_minor" integer,
	"profit_snapshot_minor" integer,
	"warranty_snapshot" jsonb,
	"delivery_estimate_snapshot" jsonb,
	"fulfillment_type_snapshot" text,
	"authorization_snapshot" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"status_type" text NOT NULL,
	"reason" text,
	"actor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"human_readable_order_number" text NOT NULL,
	"customer_id" uuid,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"customer_name" text,
	"subtotal_minor" integer NOT NULL,
	"discount_minor" integer DEFAULT 0 NOT NULL,
	"fee_minor" integer DEFAULT 0 NOT NULL,
	"tax_minor" integer DEFAULT 0 NOT NULL,
	"grand_total_minor" integer NOT NULL,
	"currency" "currency_code" DEFAULT 'NPR' NOT NULL,
	"order_status" "order_status" DEFAULT 'DRAFT' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'UNPAID' NOT NULL,
	"fulfillment_status" "fulfillment_status" DEFAULT 'NOT_STARTED' NOT NULL,
	"compliance_snapshot" jsonb,
	"terms_version" text,
	"privacy_version" text,
	"customer_ip_hash" text,
	"secure_token" text NOT NULL,
	"order_notes" text,
	"internal_notes" text,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"coupon_code" text,
	"expires_at" timestamp with time zone,
	"placed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_human_readable_order_number_unique" UNIQUE("human_readable_order_number"),
	CONSTRAINT "orders_secure_token_unique" UNIQUE("secure_token"),
	CONSTRAINT "orders_totals_nonneg" CHECK (grand_total_minor >= 0 AND subtotal_minor >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"provider" text,
	"provider_reference" text,
	"amount_minor" integer NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"raw_callback_hash" text,
	"verified_server_side" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"failure_code" text,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"scope" text DEFAULT 'GLOBAL' NOT NULL,
	"product_id" uuid,
	"variant_id" uuid,
	"rounding_mode" "rounding_mode" DEFAULT 'NEAREST_10' NOT NULL,
	"default_margin_basis_points" integer DEFAULT 2000 NOT NULL,
	"default_risk_basis_points" integer DEFAULT 500 NOT NULL,
	"default_gateway_basis_points" integer DEFAULT 200 NOT NULL,
	"default_min_profit_npr_minor" integer DEFAULT 0 NOT NULL,
	"duration_risk_rules" jsonb DEFAULT '{}'::jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_tags" (
	"product_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"variant_name" text NOT NULL,
	"duration_value" integer,
	"duration_unit" "duration_unit",
	"warranty_value" integer,
	"warranty_unit" "duration_unit",
	"warranty_coverage" text,
	"activation_method" text,
	"region" text DEFAULT 'GLOBAL',
	"eligibility_rules" jsonb DEFAULT '{}'::jsonb,
	"supplier_currency" "currency_code" DEFAULT 'USD' NOT NULL,
	"supplier_cost_minor" integer DEFAULT 0 NOT NULL,
	"supplier_cost_usd_minor" integer,
	"manual_selling_price_npr_minor" integer,
	"computed_selling_price_npr_minor" integer,
	"compare_at_price_npr_minor" integer,
	"minimum_profit_npr_minor" integer DEFAULT 0 NOT NULL,
	"target_margin_basis_points" integer DEFAULT 2000 NOT NULL,
	"risk_reserve_basis_points" integer DEFAULT 500 NOT NULL,
	"gateway_fee_basis_points" integer DEFAULT 200 NOT NULL,
	"fixed_operational_cost_npr_minor" integer DEFAULT 0 NOT NULL,
	"fx_rate_snapshot" integer,
	"pricing_mode" "pricing_mode" DEFAULT 'FORMULA_WITH_OVERRIDE' NOT NULL,
	"rounding_mode" "rounding_mode" DEFAULT 'NEAREST_10' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"purchasable" boolean DEFAULT false NOT NULL,
	"max_per_customer" integer,
	"low_stock_threshold" integer DEFAULT 3 NOT NULL,
	"seed_visible_quantity" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku"),
	CONSTRAINT "variants_cost_nonneg" CHECK (supplier_cost_minor >= 0),
	CONSTRAINT "variants_purchasable_requires_price" CHECK ((purchasable = false) OR (computed_selling_price_npr_minor IS NOT NULL OR manual_selling_price_npr_minor IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid,
	"category_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text,
	"long_description" text,
	"source_listing_text" text,
	"product_type" "product_type" NOT NULL,
	"fulfillment_type" "fulfillment_type" NOT NULL,
	"product_status" "product_status" DEFAULT 'DRAFT' NOT NULL,
	"compliance_status" "compliance_status" DEFAULT 'UNREVIEWED' NOT NULL,
	"supply_authorization_type" "supply_authorization_type" DEFAULT 'UNKNOWN' NOT NULL,
	"vendor_proof_status" "vendor_proof_status" DEFAULT 'NOT_UPLOADED' NOT NULL,
	"authorization_document_url" text,
	"authorization_reference" text,
	"supplier_invoice_reference" text,
	"proof_expiry_date" timestamp with time zone,
	"compliance_notes" text,
	"reviewed_by_admin_id" uuid,
	"reviewed_at" timestamp with time zone,
	"last_terms_review_at" timestamp with time zone,
	"next_terms_review_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"searchable" boolean DEFAULT true NOT NULL,
	"needs_data_verification" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"trademark_disclaimer" text,
	"customer_requirements" text,
	"delivery_estimate_min_minutes" integer,
	"delivery_estimate_max_minutes" integer,
	"cancellation_allowed_before_fulfillment" boolean DEFAULT true NOT NULL,
	"returnability" text,
	"support_notes" text,
	"published_at" timestamp with time zone,
	"blocked_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_public_requires_approved" CHECK ((product_status != 'PUBLIC') OR (compliance_status = 'APPROVED'))
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"full_name" text,
	"email" text NOT NULL,
	"phone" text,
	"locale" text DEFAULT 'en-NP' NOT NULL,
	"role" "app_role" DEFAULT 'CUSTOMER' NOT NULL,
	"account_status" "account_status" DEFAULT 'ACTIVE' NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "promotion_products" (
	"promotion_id" uuid NOT NULL,
	"product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"active" boolean DEFAULT false NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "redeem_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"inventory_lot_id" uuid,
	"encrypted_code" text NOT NULL,
	"code_hash" text NOT NULL,
	"assigned_order_item_id" uuid,
	"assigned_at" timestamp with time zone,
	"revealed_at" timestamp with time zone,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"payment_id" uuid,
	"amount_minor" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"customer_id" uuid,
	"order_id" uuid,
	"rating" integer NOT NULL,
	"title" text,
	"body" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secure_delivery_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fulfillment_id" uuid NOT NULL,
	"encrypted_payload" text,
	"expires_at" timestamp with time zone NOT NULL,
	"revealed_at" timestamp with time zone,
	"reveal_count" integer DEFAULT 0 NOT NULL,
	"max_reveals" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "stock_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"cart_id" uuid,
	"order_id" uuid,
	"quantity" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "reservation_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_qty_positive" CHECK (quantity > 0)
);
--> statement-breakpoint
CREATE TABLE "supplier_authorizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"product_id" uuid,
	"document_storage_path" text NOT NULL,
	"reference" text,
	"status" "vendor_proof_status" DEFAULT 'PENDING_REVIEW' NOT NULL,
	"expires_at" timestamp with time zone,
	"uploaded_by" uuid,
	"reviewed_by" uuid,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_cost_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variant_id" uuid NOT NULL,
	"supplier_id" uuid,
	"cost_minor" integer NOT NULL,
	"currency" "currency_code" NOT NULL,
	"recorded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"supplier_sku" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"contact_email" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_id" uuid NOT NULL,
	"author_id" uuid,
	"body" text NOT NULL,
	"is_internal" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"order_id" uuid,
	"subject" text NOT NULL,
	"category" text NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"assigned_to" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "warranty_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_item_id" uuid NOT NULL,
	"customer_id" uuid,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"reason" text NOT NULL,
	"resolution" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"external_event_id" text NOT NULL,
	"payload_hash" text NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"status" text DEFAULT 'RECEIVED' NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fulfillments" ADD CONSTRAINT "fulfillments_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fx_rates" ADD CONSTRAINT "fx_rates_set_by_profiles_id_fk" FOREIGN KEY ("set_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_lots" ADD CONSTRAINT "inventory_lots_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_inventory_lot_id_inventory_lots_id_fk" FOREIGN KEY ("inventory_lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_payment_submissions" ADD CONSTRAINT "manual_payment_submissions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_payment_submissions" ADD CONSTRAINT "manual_payment_submissions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manual_payment_submissions" ADD CONSTRAINT "manual_payment_submissions_reviewer_id_profiles_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_profile_id_profiles_id_fk" FOREIGN KEY ("recipient_profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_rules" ADD CONSTRAINT "pricing_rules_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_tags" ADD CONSTRAINT "product_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_reviewed_by_admin_id_profiles_id_fk" FOREIGN KEY ("reviewed_by_admin_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_inventory_lot_id_inventory_lots_id_fk" FOREIGN KEY ("inventory_lot_id") REFERENCES "public"."inventory_lots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_codes" ADD CONSTRAINT "redeem_codes_assigned_order_item_id_order_items_id_fk" FOREIGN KEY ("assigned_order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_approved_by_profiles_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secure_delivery_messages" ADD CONSTRAINT "secure_delivery_messages_fulfillment_id_fulfillments_id_fk" FOREIGN KEY ("fulfillment_id") REFERENCES "public"."fulfillments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_authorizations" ADD CONSTRAINT "supplier_authorizations_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_authorizations" ADD CONSTRAINT "supplier_authorizations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_authorizations" ADD CONSTRAINT "supplier_authorizations_uploaded_by_profiles_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_authorizations" ADD CONSTRAINT "supplier_authorizations_reviewed_by_profiles_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_cost_history" ADD CONSTRAINT "supplier_cost_history_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_cost_history" ADD CONSTRAINT "supplier_cost_history_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_cost_history" ADD CONSTRAINT "supplier_cost_history_recorded_by_profiles_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticket_id_support_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_customer_id_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_cases" ADD CONSTRAINT "warranty_cases_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranty_cases" ADD CONSTRAINT "warranty_cases_customer_id_profiles_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_uq" ON "cart_items" USING btree ("cart_id","variant_id");--> statement-breakpoint
CREATE INDEX "lots_variant_idx" ON "inventory_lots" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "movements_idempotency_uq" ON "inventory_movements" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "movements_variant_idx" ON "inventory_movements" USING btree ("variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "legal_docs_type_version_uq" ON "legal_documents" USING btree ("document_type","version");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("order_status");--> statement-breakpoint
CREATE INDEX "orders_payment_idx" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("customer_email");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_idempotency_uq" ON "payments" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "payments_order_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_tags_uq" ON "product_tags" USING btree ("product_id","tag_id");--> statement-breakpoint
CREATE INDEX "variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("product_status");--> statement-breakpoint
CREATE INDEX "products_compliance_idx" ON "products" USING btree ("compliance_status");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "redeem_codes_hash_uq" ON "redeem_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "reservations_variant_idx" ON "stock_reservations" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "stock_reservations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_provider_event_uq" ON "webhook_events" USING btree ("provider","external_event_id");