import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_silhouette" = 'heart',
      "builder_recommended_style" = 'coral',
      "builder_photo_focal_x" = CASE "slug"
        WHEN 'mintabie-dark-opal-heart-055-cts' THEN 0.49
        WHEN 'mintabie-dark-opal-heart-070cts' THEN 0.48
        ELSE 0.50
      END,
      "builder_photo_focal_y" = CASE "slug"
        WHEN 'mintabie-dark-opal-heart-055-cts' THEN 0.48
        WHEN 'mintabie-dark-opal-heart-070cts' THEN 0.43
        ELSE 0.51
      END,
      "builder_photo_zoom" = CASE "slug"
        WHEN 'mintabie-dark-opal-heart-055-cts' THEN 1.85
        WHEN 'mintabie-dark-opal-heart-070cts' THEN 2.25
        ELSE 2.20
      END,
      "builder_mapping_version" = 3,
      "builder_mapping_notes" = 'Reviewed heart silhouette and source-photo crop, 2026-07-12'
    WHERE "category" = 'raw-opals'
      AND "slug" IN (
        'mintabie-dark-opal-heart-055-cts',
        'mintabie-dark-opal-heart-070cts',
        'coober-pedy-carved-heart-1-ct'
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_silhouette" = 'cushion',
      "builder_mapping_version" = 2,
      "builder_mapping_status" = 'stale',
      "builder_eligible" = false,
      "builder_photo_focal_x" = 0.5,
      "builder_photo_focal_y" = 0.5,
      "builder_photo_zoom" = 2.25,
      "builder_mapping_notes" = NULL
    WHERE "category" = 'raw-opals'
      AND "slug" IN (
        'mintabie-dark-opal-heart-055-cts',
        'mintabie-dark-opal-heart-070cts',
        'coober-pedy-carved-heart-1-ct'
      );

  `)
}
