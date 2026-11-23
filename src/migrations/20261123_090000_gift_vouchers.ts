import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_gift_vouchers_redemptions_state" AS ENUM('held', 'captured', 'released');
    CREATE TYPE "public"."enum_gift_vouchers_status" AS ENUM('active', 'used', 'void');
    CREATE TYPE "public"."enum_gift_vouchers_source" AS ENUM('purchase', 'manual');
    CREATE TABLE IF NOT EXISTS "gift_vouchers" (
      "id" serial PRIMARY KEY NOT NULL,
      "code" varchar NOT NULL,
      "status" "enum_gift_vouchers_status" DEFAULT 'active' NOT NULL,
      "source" "enum_gift_vouchers_source" DEFAULT 'manual' NOT NULL,
      "initial_value" numeric NOT NULL,
      "balance" numeric NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "purchaser_name" varchar,
      "purchaser_email" varchar,
      "recipient_name" varchar,
      "recipient_email" varchar,
      "message" varchar,
      "stripe_checkout_session_id" varchar,
      "voucher_email_sent_at" timestamp(3) with time zone,
      "purchase_email_sent_at" timestamp(3) with time zone,
      "owner_email_sent_at" timestamp(3) with time zone,
      "email_error" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE TABLE IF NOT EXISTS "gift_vouchers_redemptions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "checkout_token" varchar NOT NULL,
      "stripe_session_id" varchar,
      "paid_order_id" integer,
      "amount" numeric NOT NULL,
      "state" "enum_gift_vouchers_redemptions_state" NOT NULL,
      "hold_expires_at" timestamp(3) with time zone,
      "held_at" timestamp(3) with time zone NOT NULL
    );
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "gift_voucher_code" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "gift_voucher_amount" numeric;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "gift_vouchers_id" integer;
    ALTER TABLE "gift_vouchers_redemptions" ADD CONSTRAINT "gift_vouchers_redemptions_paid_order_id_orders_id_fk" FOREIGN KEY ("paid_order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "gift_vouchers_redemptions" ADD CONSTRAINT "gift_vouchers_redemptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gift_vouchers"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gift_vouchers_fk" FOREIGN KEY ("gift_vouchers_id") REFERENCES "public"."gift_vouchers"("id") ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "gift_vouchers_redemptions_order_idx" ON "gift_vouchers_redemptions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "gift_vouchers_redemptions_parent_id_idx" ON "gift_vouchers_redemptions" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "gift_vouchers_redemptions_checkout_token_idx" ON "gift_vouchers_redemptions" USING btree ("checkout_token");
    CREATE INDEX IF NOT EXISTS "gift_vouchers_redemptions_paid_order_idx" ON "gift_vouchers_redemptions" USING btree ("paid_order_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "gift_vouchers_code_idx" ON "gift_vouchers" USING btree ("code");
    CREATE INDEX IF NOT EXISTS "gift_vouchers_expires_at_idx" ON "gift_vouchers" USING btree ("expires_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "gift_vouchers_stripe_checkout_session_id_idx" ON "gift_vouchers" USING btree ("stripe_checkout_session_id");
    CREATE INDEX IF NOT EXISTS "gift_vouchers_updated_at_idx" ON "gift_vouchers" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "gift_vouchers_created_at_idx" ON "gift_vouchers" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "orders_gift_voucher_code_idx" ON "orders" USING btree ("gift_voucher_code");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_gift_vouchers_id_idx" ON "payload_locked_documents_rels" USING btree ("gift_vouchers_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_gift_vouchers_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_gift_vouchers_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "gift_vouchers_id";
    DROP INDEX IF EXISTS "orders_gift_voucher_code_idx";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "gift_voucher_amount";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "gift_voucher_code";
    DROP TABLE IF EXISTS "gift_vouchers_redemptions" CASCADE;
    DROP TABLE IF EXISTS "gift_vouchers" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_gift_vouchers_redemptions_state";
    DROP TYPE IF EXISTS "public"."enum_gift_vouchers_status";
    DROP TYPE IF EXISTS "public"."enum_gift_vouchers_source";
  `)
}
