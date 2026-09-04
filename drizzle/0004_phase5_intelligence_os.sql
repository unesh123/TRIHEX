CREATE TYPE "public"."quote_status" AS ENUM('REQUESTED', 'SCOPING', 'PROPOSAL_READY', 'APPROVED', 'DECLINED', 'EXPIRED', 'CONVERTED');--> statement-breakpoint
CREATE TABLE "deal_candidates" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" uuid,
	"external_id" text,
	"vendor" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"deal_type" text NOT NULL,
	"detected_value_npr_minor" integer,
	"currency" text DEFAULT 'NPR' NOT NULL,
	"promo_code" text,
	"eligibility" text,
	"card_required" boolean DEFAULT false NOT NULL,
	"source_claim_url" text NOT NULL,
	"official_vendor_url" text NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"status" text DEFAULT 'DISCOVERED' NOT NULL,
	"approval_type" text,
	"assigned_product_id" uuid,
	"sale_rights_status" text DEFAULT 'FREE_LINK_ONLY' NOT NULL,
	"verification_score" integer DEFAULT 0 NOT NULL,
	"verification_method" text DEFAULT 'VENDOR_ENDPOINT_VERIFICATION' NOT NULL,
	"vendor_claim_summary" text,
	"verification_report" jsonb,
	"category" text DEFAULT 'PRODUCTIVITY' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"next_verification_at" timestamp with time zone,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "deal_candidates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "deal_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" text NOT NULL,
	"field" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"reason" text,
	"changed_by" text DEFAULT 'system' NOT NULL,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid,
	"feed_type" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_timestamp" text,
	"payload_hash" text NOT NULL,
	"normalized_data" jsonb NOT NULL,
	"freshness_status" text DEFAULT 'LIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'RUNNING' NOT NULL,
	"fetched_count" integer DEFAULT 0 NOT NULL,
	"created_count" integer DEFAULT 0 NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL,
	"unchanged_count" integer DEFAULT 0 NOT NULL,
	"rejected_count" integer DEFAULT 0 NOT NULL,
	"error_category" text,
	"error_message_sanitized" text,
	"parser_version" text DEFAULT '1.0.0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prompt_id" text NOT NULL,
	"version" integer NOT NULL,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompts" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" uuid,
	"external_id" text,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"type" text DEFAULT 'TEXT' NOT NULL,
	"category" text DEFAULT 'PRODUCTIVITY' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"author" text NOT NULL,
	"source_url" text,
	"license" text DEFAULT 'UNKNOWN' NOT NULL,
	"votes" integer DEFAULT 0 NOT NULL,
	"variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_original_trihex" boolean DEFAULT false NOT NULL,
	"model_compatibility" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'PUBLISHED' NOT NULL,
	"difficulty" text DEFAULT 'INTERMEDIATE' NOT NULL,
	"quality_status" text DEFAULT 'CURATED' NOT NULL,
	"content_hash" text NOT NULL,
	"synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quote_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"message" text NOT NULL,
	"actor_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"secure_token" text NOT NULL,
	"customer_name" text NOT NULL,
	"business_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"team_size" text,
	"budget_range" text,
	"goal" text NOT NULL,
	"current_tools" text,
	"requested_services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quote_snapshot" jsonb,
	"status" "quote_status" DEFAULT 'REQUESTED' NOT NULL,
	"valid_until" timestamp with time zone,
	"approved_at" timestamp with time zone,
	"converted_order_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quotes_reference_unique" UNIQUE("reference"),
	CONSTRAINT "quotes_secure_token_unique" UNIQUE("secure_token")
);
--> statement-breakpoint
CREATE TABLE "resource_health" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text NOT NULL,
	"status" text DEFAULT 'HEALTHY' NOT NULL,
	"latency_ms" integer,
	"last_checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"next_check_at" timestamp with time zone,
	"last_http_status" integer,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_text" text NOT NULL,
	"normalized_query" text NOT NULL,
	"result_count" integer NOT NULL,
	"clicked_entity_type" text,
	"clicked_entity_id" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"base_url" text NOT NULL,
	"source_type" text NOT NULL,
	"ingestion_method" text NOT NULL,
	"trust_level" text DEFAULT 'COMMUNITY_VERIFIED' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"refresh_interval_minutes" integer DEFAULT 60 NOT NULL,
	"robots_reviewed_at" timestamp with time zone,
	"terms_reviewed_at" timestamp with time zone,
	"license_notes" text,
	"last_successful_sync_at" timestamp with time zone,
	"last_failed_sync_at" timestamp with time zone,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"health_status" text DEFAULT 'HEALTHY' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sources_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "watchlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"condition" text NOT NULL,
	"channel" text DEFAULT 'EMAIL' NOT NULL,
	"target_value" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_triggered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "manual_payment_submissions" ADD COLUMN "proof_content_hash" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_activated" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_email_sent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_whatsapp_delivered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_notes" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "fulfillment_delivered_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "author_name" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "category_slug" text;--> statement-breakpoint
ALTER TABLE "deal_candidates" ADD CONSTRAINT "deal_candidates_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_candidates" ADD CONSTRAINT "deal_candidates_assigned_product_id_products_id_fk" FOREIGN KEY ("assigned_product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_revisions" ADD CONSTRAINT "deal_revisions_deal_id_deal_candidates_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deal_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_snapshots" ADD CONSTRAINT "feed_snapshots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_prompt_id_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_events" ADD CONSTRAINT "quote_events_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_events" ADD CONSTRAINT "quote_events_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_converted_order_id_orders_id_fk" FOREIGN KEY ("converted_order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deal_candidates_status_idx" ON "deal_candidates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "deal_candidates_vendor_idx" ON "deal_candidates" USING btree ("vendor");--> statement-breakpoint
CREATE INDEX "deal_candidates_valid_until_idx" ON "deal_candidates" USING btree ("valid_until");--> statement-breakpoint
CREATE INDEX "deal_candidates_published_at_idx" ON "deal_candidates" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "deal_candidates_category_idx" ON "deal_candidates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "deal_revisions_deal_idx" ON "deal_revisions" USING btree ("deal_id");--> statement-breakpoint
CREATE INDEX "feed_snapshots_type_idx" ON "feed_snapshots" USING btree ("feed_type");--> statement-breakpoint
CREATE INDEX "feed_snapshots_fetched_idx" ON "feed_snapshots" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX "ingestion_runs_source_idx" ON "ingestion_runs" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "ingestion_runs_started_idx" ON "ingestion_runs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "prompt_versions_prompt_idx" ON "prompt_versions" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "prompts_category_idx" ON "prompts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "prompts_status_idx" ON "prompts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "prompts_original_idx" ON "prompts" USING btree ("is_original_trihex");--> statement-breakpoint
CREATE INDEX "quote_events_quote_idx" ON "quote_events" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quotes_phone_idx" ON "quotes" USING btree ("customer_phone");--> statement-breakpoint
CREATE INDEX "quotes_created_idx" ON "quotes" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "resource_health_type_id_unique" ON "resource_health" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "resource_health_status_idx" ON "resource_health" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_items_user_entity_unique" ON "saved_items" USING btree ("user_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "saved_items_user_idx" ON "saved_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "search_analytics_query_idx" ON "search_analytics" USING btree ("normalized_query");--> statement-breakpoint
CREATE INDEX "search_analytics_created_idx" ON "search_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "search_analytics_zero_results_idx" ON "search_analytics" USING btree ("result_count");--> statement-breakpoint
CREATE INDEX "sources_slug_idx" ON "sources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sources_health_status_idx" ON "sources" USING btree ("health_status");--> statement-breakpoint
CREATE INDEX "watchlists_user_idx" ON "watchlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "watchlists_entity_idx" ON "watchlists" USING btree ("entity_type","entity_id");