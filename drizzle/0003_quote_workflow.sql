CREATE TYPE "public"."quote_status" AS ENUM('REQUESTED', 'SCOPING', 'PROPOSAL_READY', 'APPROVED', 'DECLINED', 'EXPIRED', 'CONVERTED');--> statement-breakpoint

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
);--> statement-breakpoint

CREATE TABLE "quote_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "quote_id" uuid NOT NULL,
  "event_type" text NOT NULL,
  "message" text NOT NULL,
  "actor_id" uuid,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint

ALTER TABLE "quote_events" ADD CONSTRAINT "quote_events_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_events" ADD CONSTRAINT "quote_events_actor_id_profiles_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_converted_order_id_orders_id_fk" FOREIGN KEY ("converted_order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "quote_events_quote_idx" ON "quote_events" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quotes_status_idx" ON "quotes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quotes_phone_idx" ON "quotes" USING btree ("customer_phone");--> statement-breakpoint
CREATE INDEX "quotes_created_idx" ON "quotes" USING btree ("created_at");
