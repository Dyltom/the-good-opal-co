import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_version" = 3,
      "builder_mapping_reviewed_at" = NOW()
    WHERE "category" = 'raw-opals'
      AND "status" = 'published';

    UPDATE "products"
    SET
      "builder_silhouette" = 'heart',
      "builder_recommended_style" = 'coral',
      "builder_mapping_status" = 'manual',
      "builder_mapping_version" = 3,
      "builder_eligible" = true,
      "builder_photo_focal_x" = CASE
        WHEN lower("name") LIKE '%0.55 cts%' THEN 0.49
        WHEN lower("name") LIKE '%0.70cts%' THEN 0.48
        ELSE 0.50
      END,
      "builder_photo_focal_y" = CASE
        WHEN lower("name") LIKE '%0.55 cts%' THEN 0.48
        WHEN lower("name") LIKE '%0.70cts%' THEN 0.43
        ELSE 0.51
      END,
      "builder_photo_zoom" = CASE
        WHEN lower("name") LIKE '%0.55 cts%' THEN 1.85
        WHEN lower("name") LIKE '%0.70cts%' THEN 2.25
        ELSE 2.20
      END,
      "builder_mapping_notes" = 'Reviewed heart silhouette and source-photo crop, 2026-07-12'
    WHERE "category" = 'raw-opals'
      AND lower("name") ~ 'heart'
      AND lower("name") !~ 'parcel';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_mapping_status" = 'stale',
      "builder_eligible" = false
    WHERE "category" = 'raw-opals'
      AND "builder_mapping_version" = 3;
  `)
}
