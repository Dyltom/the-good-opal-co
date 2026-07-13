import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_silhouette" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 'pear'
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 'elongated'
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 'oval'
        WHEN 'lightning-ridge-semi-black-opal-5-50-cts' THEN 'elongated'
        WHEN 'coober-pedy-white-opal-6-35-cts' THEN 'oval'
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 'elongated'
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 'oval'
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 'pear'
      END,
      "builder_recommended_style" = CASE
        WHEN "slug" IN (
          'lightning-ridge-black-opal-6-30ct',
          'lightning-ridge-white-opal-1-70-cts-2'
        ) THEN 'aurora'
        ELSE 'gemini'
      END,
      "builder_mapped_image_index" = CASE
        WHEN "slug" = 'lightning-ridge-white-opal-1-70-cts-2' THEN 1
        ELSE 0
      END,
      "builder_photo_focal_x" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 0.452
        WHEN 'lightning-ridge-semi-black-opal-5-50-cts' THEN 0.526
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 0.372
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 0.52
        ELSE 0.50
      END,
      "builder_photo_focal_y" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 0.537
        WHEN 'lightning-ridge-semi-black-opal-5-50-cts' THEN 0.584
        WHEN 'coober-pedy-white-opal-6-35-cts' THEN 0.52
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 0.53
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 0.506
        ELSE 0.50
      END,
      "builder_photo_zoom" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 3.20
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 4.75
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 4.75
        WHEN 'lightning-ridge-semi-black-opal-5-50-cts' THEN 3.91
        WHEN 'coober-pedy-white-opal-6-35-cts' THEN 3.35
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 3.75
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 6.12
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 2.45
      END,
      "builder_photo_rotation" = 0,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_version" = 5,
      "builder_mapping_source_image_hash" = NULL,
      "builder_mapping_input_hash" = NULL,
      "builder_mapping_analyzed_image_hash" = NULL,
      "builder_photo_analysis_version" = NULL,
      "builder_photo_analysis_confidence" = NULL,
      "builder_mapping_analysis_error" = NULL,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Audited against selected catalogue photography, 2026-07-14'
    WHERE "slug" IN (
      'lightning-ridge-black-opal-6-30ct',
      'lightning-ridge-black-opal-1-45-cts',
      'lightning-ridge-semi-black-opal-1-40-cts',
      'lightning-ridge-semi-black-opal-5-50-cts',
      'coober-pedy-white-opal-6-35-cts',
      'mintabie-semi-black-opal-6-80-cts',
      'coober-pedy-white-opal-2-30-cts-copy',
      'lightning-ridge-white-opal-1-70-cts-2'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_mapping_status" = 'stale',
      "builder_mapping_mode" = 'inferred',
      "builder_mapped_image_index" = 0,
      "builder_mapping_input_hash" = NULL,
      "builder_mapping_source_image_hash" = NULL
    WHERE "slug" IN (
      'lightning-ridge-black-opal-6-30ct',
      'lightning-ridge-black-opal-1-45-cts',
      'lightning-ridge-semi-black-opal-1-40-cts',
      'lightning-ridge-semi-black-opal-5-50-cts',
      'coober-pedy-white-opal-6-35-cts',
      'mintabie-semi-black-opal-6-80-cts',
      'coober-pedy-white-opal-2-30-cts-copy',
      'lightning-ridge-white-opal-1-70-cts-2'
    );
  `)
}
