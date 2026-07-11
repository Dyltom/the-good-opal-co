import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_custom_quotes_delivery_status" AS ENUM(
      'not-sent', 'issuing', 'sent', 'failed'
    );
    ALTER TYPE "public"."enum_custom_quote_events_event_type"
      ADD VALUE IF NOT EXISTS 'deposit-disputed';
    ALTER TYPE "public"."enum_custom_quote_events_event_type"
      ADD VALUE IF NOT EXISTS 'deposit-dispute-resolved';

    ALTER TABLE "custom_quotes"
      ADD COLUMN "stripe_refunded_amount_cents" numeric DEFAULT 0,
      ADD COLUMN "refunded_at" timestamp(3) with time zone,
      ADD COLUMN "accepted_statement_version" varchar,
      ADD COLUMN "accepted_evidence_hash" varchar,
      ADD COLUMN "deposit_checkout_generation" numeric DEFAULT 0,
      ADD COLUMN "pending_stripe_checkout_session_id" varchar,
      ADD COLUMN "pending_stripe_checkout_expires_at" timestamp(3) with time zone,
      ADD COLUMN "stripe_dispute_id" varchar,
      ADD COLUMN "stripe_dispute_status" varchar,
      ADD COLUMN "deposit_disputed_at" timestamp(3) with time zone,
      ADD COLUMN "stripe_dispute_event_at" timestamp(3) with time zone,
      ADD COLUMN "link_version" numeric DEFAULT 1 NOT NULL,
      ADD COLUMN "customer_email_sent_at" timestamp(3) with time zone,
      ADD COLUMN "customer_email_provider_id" varchar,
      ADD COLUMN "customer_email_error" varchar,
      ADD COLUMN "delivery_status" "enum_custom_quotes_delivery_status" DEFAULT 'not-sent' NOT NULL,
      ADD COLUMN "delivery_attempt_count" numeric DEFAULT 0,
      ADD COLUMN "delivery_last_attempt_at" timestamp(3) with time zone,
      ADD COLUMN "deposit_confirmation_email_sent_at" timestamp(3) with time zone,
      ADD COLUMN "deposit_confirmation_email_provider_id" varchar,
      ADD COLUMN "deposit_confirmation_email_error" varchar;

    CREATE UNIQUE INDEX "custom_quotes_pending_stripe_checkout_session_id_idx"
      ON "custom_quotes" ("pending_stripe_checkout_session_id");
    CREATE UNIQUE INDEX "custom_quotes_stripe_dispute_id_idx"
      ON "custom_quotes" ("stripe_dispute_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "custom_quotes_stripe_dispute_id_idx";
    DROP INDEX "custom_quotes_pending_stripe_checkout_session_id_idx";
    ALTER TABLE "custom_quotes"
      DROP COLUMN "deposit_confirmation_email_error",
      DROP COLUMN "deposit_confirmation_email_provider_id",
      DROP COLUMN "deposit_confirmation_email_sent_at",
      DROP COLUMN "delivery_last_attempt_at",
      DROP COLUMN "delivery_attempt_count",
      DROP COLUMN "delivery_status",
      DROP COLUMN "customer_email_error",
      DROP COLUMN "customer_email_provider_id",
      DROP COLUMN "customer_email_sent_at",
      DROP COLUMN "link_version",
      DROP COLUMN "stripe_dispute_event_at",
      DROP COLUMN "deposit_disputed_at",
      DROP COLUMN "stripe_dispute_status",
      DROP COLUMN "stripe_dispute_id",
      DROP COLUMN "pending_stripe_checkout_expires_at",
      DROP COLUMN "pending_stripe_checkout_session_id",
      DROP COLUMN "deposit_checkout_generation",
      DROP COLUMN "accepted_evidence_hash",
      DROP COLUMN "accepted_statement_version",
      DROP COLUMN "refunded_at",
      DROP COLUMN "stripe_refunded_amount_cents";
    DROP TYPE "public"."enum_custom_quotes_delivery_status";
  `)
}
