import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_state" DROP NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_postal_code" DROP NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "orders" SET "shipping_address_state" = ''
      WHERE "shipping_address_state" IS NULL;
    UPDATE "orders" SET "shipping_address_postal_code" = ''
      WHERE "shipping_address_postal_code" IS NULL;
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_state" SET NOT NULL;
    ALTER TABLE "orders" ALTER COLUMN "shipping_address_postal_code" SET NOT NULL;
  `)
}
