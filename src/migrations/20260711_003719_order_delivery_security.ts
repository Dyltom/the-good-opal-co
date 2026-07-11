import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_orders_status" ADD VALUE 'disputed';
  ALTER TABLE "products" ALTER COLUMN "certified" SET DEFAULT false;
  ALTER TABLE "orders" ADD COLUMN "confirmation_email_sent_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "confirmation_email_error" varchar;
  ALTER TABLE "orders" ADD COLUMN "inventory_restocked_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "inventory_decremented_at" timestamp(3) with time zone;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
  DROP TYPE "public"."enum_orders_status";
  CREATE TYPE "public"."enum_orders_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
  ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."enum_orders_status";
  ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."enum_orders_status" USING "status"::"public"."enum_orders_status";
  ALTER TABLE "products" ALTER COLUMN "certified" SET DEFAULT true;
  ALTER TABLE "orders" DROP COLUMN "confirmation_email_sent_at";
  ALTER TABLE "orders" DROP COLUMN "confirmation_email_error";
  ALTER TABLE "orders" DROP COLUMN "inventory_restocked_at";
  ALTER TABLE "orders" DROP COLUMN "inventory_decremented_at";`)
}
