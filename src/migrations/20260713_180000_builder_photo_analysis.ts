import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "builder_mapping_mode" varchar,
      ADD COLUMN IF NOT EXISTS "builder_mapped_image_index" numeric DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "builder_mapping_analyzed_image_hash" varchar,
      ADD COLUMN IF NOT EXISTS "builder_photo_analysis_version" numeric,
      ADD COLUMN IF NOT EXISTS "builder_photo_analysis_confidence" numeric,
      ADD COLUMN IF NOT EXISTS "builder_mapping_analysis_error" varchar,
      ADD COLUMN IF NOT EXISTS "builder_photo_rotation" numeric DEFAULT 0;

    UPDATE "products"
    SET
      "builder_mapping_mode" = CASE
        WHEN "builder_mapping_status" = 'manual' THEN 'manual'
        ELSE 'inferred'
      END,
      "builder_mapped_image_index" = COALESCE("builder_mapped_image_index", 0),
      "builder_photo_rotation" = COALESCE("builder_photo_rotation", 0),
      "builder_mapping_version" = 5
    WHERE "category" = 'raw-opals';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "builder_photo_rotation",
      DROP COLUMN IF EXISTS "builder_mapping_analysis_error",
      DROP COLUMN IF EXISTS "builder_photo_analysis_confidence",
      DROP COLUMN IF EXISTS "builder_photo_analysis_version",
      DROP COLUMN IF EXISTS "builder_mapping_analyzed_image_hash",
      DROP COLUMN IF EXISTS "builder_mapped_image_index",
      DROP COLUMN IF EXISTS "builder_mapping_mode";
  `)
}
