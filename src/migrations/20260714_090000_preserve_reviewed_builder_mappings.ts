import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

/**
 * v5 changed the input-hash shape. The next Woo reconciliation correctly saw
 * a different hash, but could not distinguish that one-time format change from
 * a real source-photo change. Preserve the 45 previously reviewed catalogue
 * mappings and let their next product write establish the v5 hash baseline.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_version" = 5,
      "builder_mapping_source_image_hash" = NULL,
      "builder_mapping_input_hash" = NULL,
      "builder_mapping_analyzed_image_hash" = NULL,
      "builder_photo_analysis_version" = NULL,
      "builder_photo_analysis_confidence" = NULL,
      "builder_mapping_analysis_error" = NULL
    WHERE "category" = 'raw-opals'
      AND "builder_mapping_status" = 'stale'
      AND "builder_mapping_reviewed_at" IS NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_mapping_status" = 'stale',
      "builder_mapping_mode" = 'inferred'
    WHERE "category" = 'raw-opals'
      AND "builder_mapping_version" = 5
      AND "builder_mapping_reviewed_at" IS NOT NULL;
  `)
}
