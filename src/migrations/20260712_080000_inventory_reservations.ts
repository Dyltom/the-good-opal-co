import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_inventory_reservations_status" AS ENUM(
      'active',
      'pending-payment',
      'consumed',
      'released'
    );

    CREATE TABLE "inventory_reservations_items" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "product_id" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "name" varchar NOT NULL,
      "unit_amount_cents" numeric NOT NULL,
      "quantity" numeric NOT NULL
    );

    CREATE TABLE "inventory_reservations" (
      "id" serial PRIMARY KEY NOT NULL,
      "token" varchar NOT NULL,
      "stripe_session_id" varchar NOT NULL,
      "status" "enum_inventory_reservations_status" DEFAULT 'active' NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "released_at" timestamp(3) with time zone,
      "release_reason" varchar,
      "consumed_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "orders" ADD COLUMN "inventory_reservation_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inventory_reservations_id" integer;

    ALTER TABLE "inventory_reservations_items"
      ADD CONSTRAINT "inventory_reservations_items_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."inventory_reservations"("id")
      ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "orders"
      ADD CONSTRAINT "orders_inventory_reservation_id_inventory_reservations_id_fk"
      FOREIGN KEY ("inventory_reservation_id") REFERENCES "public"."inventory_reservations"("id")
      ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_inventory_reservations_fk"
      FOREIGN KEY ("inventory_reservations_id") REFERENCES "public"."inventory_reservations"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "inventory_reservations_items_order_idx"
      ON "inventory_reservations_items" USING btree ("_order");
    CREATE INDEX "inventory_reservations_items_parent_id_idx"
      ON "inventory_reservations_items" USING btree ("_parent_id");
    CREATE UNIQUE INDEX "inventory_reservations_token_idx"
      ON "inventory_reservations" USING btree ("token");
    CREATE UNIQUE INDEX "inventory_reservations_stripe_session_id_idx"
      ON "inventory_reservations" USING btree ("stripe_session_id");
    CREATE INDEX "inventory_reservations_expires_at_idx"
      ON "inventory_reservations" USING btree ("expires_at");
    CREATE INDEX "inventory_reservations_updated_at_idx"
      ON "inventory_reservations" USING btree ("updated_at");
    CREATE INDEX "inventory_reservations_created_at_idx"
      ON "inventory_reservations" USING btree ("created_at");
    CREATE INDEX "orders_inventory_reservation_idx"
      ON "orders" USING btree ("inventory_reservation_id");
    CREATE INDEX "payload_locked_documents_rels_inventory_reservations_id_idx"
      ON "payload_locked_documents_rels" USING btree ("inventory_reservations_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_inventory_reservations_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_inventory_reservations_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "inventory_reservations_id";
    DROP INDEX IF EXISTS "orders_inventory_reservation_idx";
    ALTER TABLE "orders"
      DROP CONSTRAINT IF EXISTS "orders_inventory_reservation_id_inventory_reservations_id_fk";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "inventory_reservation_id";
    DROP TABLE IF EXISTS "inventory_reservations_items" CASCADE;
    DROP TABLE IF EXISTS "inventory_reservations" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_inventory_reservations_status";
  `)
}
