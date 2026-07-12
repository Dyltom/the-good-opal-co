import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "builder_mapping_status" varchar,
      ADD COLUMN IF NOT EXISTS "builder_mapping_confidence" numeric,
      ADD COLUMN IF NOT EXISTS "builder_mapping_version" numeric,
      ADD COLUMN IF NOT EXISTS "builder_mapping_source_image_hash" varchar,
      ADD COLUMN IF NOT EXISTS "builder_mapping_input_hash" varchar,
      ADD COLUMN IF NOT EXISTS "builder_mapping_reviewed_at" timestamp(3) with time zone,
      ADD COLUMN IF NOT EXISTS "builder_mapping_notes" varchar;

    UPDATE "products"
    SET
      "builder_mapping_status" = CASE
        WHEN "category" = 'raw-opals' THEN 'reviewed'
        ELSE NULL
      END,
      "builder_mapping_confidence" = CASE
        WHEN "builder_eligible" = true THEN 1
        ELSE 0
      END,
      "builder_mapping_version" = 1,
      "builder_mapping_reviewed_at" = CASE
        WHEN "category" = 'raw-opals' THEN COALESCE("updated_at", NOW())
        ELSE NULL
      END
    WHERE "category" = 'raw-opals'
      AND "builder_mapping_status" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "builder_mapping_notes",
      DROP COLUMN IF EXISTS "builder_mapping_reviewed_at",
      DROP COLUMN IF EXISTS "builder_mapping_input_hash",
      DROP COLUMN IF EXISTS "builder_mapping_source_image_hash",
      DROP COLUMN IF EXISTS "builder_mapping_version",
      DROP COLUMN IF EXISTS "builder_mapping_confidence",
      DROP COLUMN IF EXISTS "builder_mapping_status";
  `)
}
