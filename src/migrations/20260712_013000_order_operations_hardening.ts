import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "stripe_dispute_id" varchar,
      ADD COLUMN IF NOT EXISTS "stripe_dispute_status" varchar,
      ADD COLUMN IF NOT EXISTS "status_before_dispute" varchar,
      ADD COLUMN IF NOT EXISTS "shipment_email_sent_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "shipment_email_error" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "shipment_email_error",
      DROP COLUMN IF EXISTS "shipment_email_sent_at",
      DROP COLUMN IF EXISTS "status_before_dispute",
      DROP COLUMN IF EXISTS "stripe_dispute_status",
      DROP COLUMN IF EXISTS "stripe_dispute_id";
  `)
}
