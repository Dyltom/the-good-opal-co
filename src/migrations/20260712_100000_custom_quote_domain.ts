import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_custom_quotes_status" AS ENUM(
      'draft', 'sent', 'accepted', 'expired', 'cancelled', 'superseded'
    );
    CREATE TYPE "public"."enum_custom_quotes_currency" AS ENUM('AUD');
    CREATE TYPE "public"."enum_custom_quotes_deposit_status" AS ENUM(
      'not-required', 'awaiting-payment', 'paid', 'refunded'
    );
    CREATE TYPE "public"."enum_custom_quote_events_event_type" AS ENUM(
      'created', 'sent', 'accepted', 'expired', 'cancelled', 'superseded',
      'deposit-paid', 'deposit-refunded'
    );
    CREATE TYPE "public"."enum_custom_quote_events_actor_type" AS ENUM(
      'admin', 'customer', 'stripe', 'system'
    );

    CREATE TABLE "custom_quotes" (
      "id" serial PRIMARY KEY NOT NULL,
      "quote_number" varchar NOT NULL,
      "quote_series_id" varchar NOT NULL,
      "revision" numeric NOT NULL,
      "supersedes_id" integer,
      "enquiry_id" integer NOT NULL,
      "customer_email" varchar NOT NULL,
      "status" "enum_custom_quotes_status" DEFAULT 'draft' NOT NULL,
      "amount_cents" numeric NOT NULL,
      "deposit_amount_cents" numeric DEFAULT 0 NOT NULL,
      "currency" "enum_custom_quotes_currency" DEFAULT 'AUD' NOT NULL,
      "valid_until" timestamp(3) with time zone NOT NULL,
      "terms" varchar NOT NULL,
      "accepted_at" timestamp(3) with time zone,
      "accepted_by_email" varchar,
      "accepted_terms_hash" varchar,
      "deposit_status" "enum_custom_quotes_deposit_status" DEFAULT 'not-required' NOT NULL,
      "amount_paid_cents" numeric,
      "paid_at" timestamp(3) with time zone,
      "stripe_checkout_session_id" varchar,
      "stripe_payment_intent_id" varchar,
      "internal_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "custom_quote_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "quote_id" integer NOT NULL,
      "enquiry_id" integer NOT NULL,
      "event_type" "enum_custom_quote_events_event_type" NOT NULL,
      "occurred_at" timestamp(3) with time zone NOT NULL,
      "quote_revision" numeric NOT NULL,
      "actor_type" "enum_custom_quote_events_actor_type" NOT NULL,
      "actor_email" varchar,
      "amount_cents" numeric NOT NULL,
      "deposit_amount_cents" numeric NOT NULL,
      "currency" varchar NOT NULL,
      "valid_until" timestamp(3) with time zone NOT NULL,
      "terms_snapshot" varchar NOT NULL,
      "terms_hash" varchar NOT NULL,
      "evidence" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "custom_quotes_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "custom_quote_events_id" integer;

    ALTER TABLE "custom_quotes"
      ADD CONSTRAINT "custom_quotes_supersedes_id_custom_quotes_id_fk"
      FOREIGN KEY ("supersedes_id") REFERENCES "public"."custom_quotes"("id")
      ON DELETE set null ON UPDATE no action;
    ALTER TABLE "custom_quotes"
      ADD CONSTRAINT "custom_quotes_enquiry_id_enquiries_id_fk"
      FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id")
      ON DELETE restrict ON UPDATE no action;
    ALTER TABLE "custom_quote_events"
      ADD CONSTRAINT "custom_quote_events_quote_id_custom_quotes_id_fk"
      FOREIGN KEY ("quote_id") REFERENCES "public"."custom_quotes"("id")
      ON DELETE restrict ON UPDATE no action;
    ALTER TABLE "custom_quote_events"
      ADD CONSTRAINT "custom_quote_events_enquiry_id_enquiries_id_fk"
      FOREIGN KEY ("enquiry_id") REFERENCES "public"."enquiries"("id")
      ON DELETE restrict ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_custom_quotes_fk"
      FOREIGN KEY ("custom_quotes_id") REFERENCES "public"."custom_quotes"("id")
      ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_custom_quote_events_fk"
      FOREIGN KEY ("custom_quote_events_id") REFERENCES "public"."custom_quote_events"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "custom_quotes_quote_number_idx" ON "custom_quotes" ("quote_number");
    CREATE INDEX "custom_quotes_quote_series_id_idx" ON "custom_quotes" ("quote_series_id");
    CREATE INDEX "custom_quotes_supersedes_idx" ON "custom_quotes" ("supersedes_id");
    CREATE INDEX "custom_quotes_enquiry_idx" ON "custom_quotes" ("enquiry_id");
    CREATE INDEX "custom_quotes_customer_email_idx" ON "custom_quotes" ("customer_email");
    CREATE UNIQUE INDEX "custom_quotes_stripe_checkout_session_id_idx"
      ON "custom_quotes" ("stripe_checkout_session_id");
    CREATE UNIQUE INDEX "custom_quotes_stripe_payment_intent_id_idx"
      ON "custom_quotes" ("stripe_payment_intent_id");
    CREATE INDEX "custom_quotes_updated_at_idx" ON "custom_quotes" ("updated_at");
    CREATE INDEX "custom_quotes_created_at_idx" ON "custom_quotes" ("created_at");
    CREATE INDEX "custom_quote_events_quote_idx" ON "custom_quote_events" ("quote_id");
    CREATE INDEX "custom_quote_events_enquiry_idx" ON "custom_quote_events" ("enquiry_id");
    CREATE INDEX "custom_quote_events_updated_at_idx" ON "custom_quote_events" ("updated_at");
    CREATE INDEX "custom_quote_events_created_at_idx" ON "custom_quote_events" ("created_at");
    CREATE INDEX "payload_locked_documents_rels_custom_quotes_id_idx"
      ON "payload_locked_documents_rels" ("custom_quotes_id");
    CREATE INDEX "payload_locked_documents_rels_custom_quote_events_id_idx"
      ON "payload_locked_documents_rels" ("custom_quote_events_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_custom_quote_events_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_custom_quotes_fk";
    DROP INDEX "payload_locked_documents_rels_custom_quote_events_id_idx";
    DROP INDEX "payload_locked_documents_rels_custom_quotes_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "custom_quote_events_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "custom_quotes_id";
    DROP TABLE "custom_quote_events" CASCADE;
    DROP TABLE "custom_quotes" CASCADE;
    DROP TYPE "public"."enum_custom_quote_events_actor_type";
    DROP TYPE "public"."enum_custom_quote_events_event_type";
    DROP TYPE "public"."enum_custom_quotes_deposit_status";
    DROP TYPE "public"."enum_custom_quotes_currency";
    DROP TYPE "public"."enum_custom_quotes_status";
  `)
}
