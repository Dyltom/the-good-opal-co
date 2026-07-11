import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "legacy_woo_id" numeric;
  ALTER TABLE "products" ADD COLUMN "woo_status" varchar;
  ALTER TABLE "products" ADD COLUMN "woo_catalog_visibility" varchar;
  ALTER TABLE "products" ADD COLUMN "woo_manage_stock" boolean;
  ALTER TABLE "products" ADD COLUMN "woo_modified_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "source" varchar DEFAULT 'stripe' NOT NULL;
  ALTER TABLE "orders" ADD COLUMN "legacy_woo_id" numeric;
  ALTER TABLE "orders" ADD COLUMN "legacy_woo_status" varchar;
  ALTER TABLE "orders" ADD COLUMN "order_placed_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "billing_address_line1" varchar;
  ALTER TABLE "orders" ADD COLUMN "billing_address_line2" varchar;
  ALTER TABLE "orders" ADD COLUMN "billing_address_city" varchar;
  ALTER TABLE "orders" ADD COLUMN "billing_address_state" varchar;
  ALTER TABLE "orders" ADD COLUMN "billing_address_postal_code" varchar;
  ALTER TABLE "orders" ADD COLUMN "billing_address_country" varchar;
  ALTER TABLE "orders" ADD COLUMN "payment_method" varchar;
  ALTER TABLE "orders" ADD COLUMN "legacy_transaction_id" varchar;
  ALTER TABLE "orders" ADD COLUMN "legacy_refunds" jsonb;
  ALTER TABLE "customers" ADD COLUMN "legacy_woo_id" numeric;
  ALTER TABLE "customers" ADD COLUMN "woo_created_at" timestamp(3) with time zone;
  CREATE UNIQUE INDEX "products_legacy_woo_id_idx" ON "products" USING btree ("legacy_woo_id");
  CREATE UNIQUE INDEX "orders_legacy_woo_id_idx" ON "orders" USING btree ("legacy_woo_id");
  CREATE UNIQUE INDEX "customers_legacy_woo_id_idx" ON "customers" USING btree ("legacy_woo_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "products_legacy_woo_id_idx";
  DROP INDEX "orders_legacy_woo_id_idx";
  DROP INDEX "customers_legacy_woo_id_idx";
  ALTER TABLE "products" DROP COLUMN "legacy_woo_id";
  ALTER TABLE "products" DROP COLUMN "woo_status";
  ALTER TABLE "products" DROP COLUMN "woo_catalog_visibility";
  ALTER TABLE "products" DROP COLUMN "woo_manage_stock";
  ALTER TABLE "products" DROP COLUMN "woo_modified_at";
  ALTER TABLE "orders" DROP COLUMN "source";
  ALTER TABLE "orders" DROP COLUMN "legacy_woo_id";
  ALTER TABLE "orders" DROP COLUMN "legacy_woo_status";
  ALTER TABLE "orders" DROP COLUMN "order_placed_at";
  ALTER TABLE "orders" DROP COLUMN "paid_at";
  ALTER TABLE "orders" DROP COLUMN "billing_address_line1";
  ALTER TABLE "orders" DROP COLUMN "billing_address_line2";
  ALTER TABLE "orders" DROP COLUMN "billing_address_city";
  ALTER TABLE "orders" DROP COLUMN "billing_address_state";
  ALTER TABLE "orders" DROP COLUMN "billing_address_postal_code";
  ALTER TABLE "orders" DROP COLUMN "billing_address_country";
  ALTER TABLE "orders" DROP COLUMN "payment_method";
  ALTER TABLE "orders" DROP COLUMN "legacy_transaction_id";
  ALTER TABLE "orders" DROP COLUMN "legacy_refunds";
  ALTER TABLE "customers" DROP COLUMN "legacy_woo_id";
  ALTER TABLE "customers" DROP COLUMN "woo_created_at";`)
}
