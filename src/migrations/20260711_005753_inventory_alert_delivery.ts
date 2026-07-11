import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_products_stone_type" ADD VALUE 'opal-doublet';
  ALTER TABLE "orders" ADD COLUMN "inventory_alert_sent_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "inventory_alert_error" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ALTER COLUMN "stone_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_products_stone_type";
  CREATE TYPE "public"."enum_products_stone_type" AS ENUM('black-opal', 'white-opal', 'boulder-opal', 'crystal-opal', 'fire-opal', 'matrix-opal');
  ALTER TABLE "products" ALTER COLUMN "stone_type" SET DATA TYPE "public"."enum_products_stone_type" USING "stone_type"::"public"."enum_products_stone_type";
  ALTER TABLE "orders" DROP COLUMN "inventory_alert_sent_at";
  ALTER TABLE "orders" DROP COLUMN "inventory_alert_error";`)
}
