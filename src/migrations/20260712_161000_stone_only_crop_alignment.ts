import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.507,
      "builder_photo_focal_y" = 0.489,
      "builder_photo_zoom" = 4.16,
      "builder_mapping_status" = 'manual',
      "builder_mapping_version" = 5,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Chrome-verified stone-only crop, 2026-07-12'
    WHERE "slug" IN (
      'lightning-ridge-white-opal-1-05-cts',
      'lightning-ridge-white-opal-105-ct'
    );

    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.5,
      "builder_photo_focal_y" = 0.51,
      "builder_photo_zoom" = 2.5,
      "builder_mapping_status" = 'manual',
      "builder_mapping_version" = 5,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Chrome-verified carved-heart crop and contour, 2026-07-12'
    WHERE "slug" = 'coober-pedy-carved-heart-1-ct';

    UPDATE "products"
    SET
      "builder_silhouette" = 'pear',
      "builder_recommended_style" = 'aurora',
      "builder_photo_focal_x" = 0.54,
      "builder_photo_focal_y" = 0.57,
      "builder_photo_zoom" = 4.7,
      "builder_mapping_status" = 'manual',
      "builder_mapping_version" = 5,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Chrome-verified stone-only crop removes fingers from 3D cabochon, 2026-07-12'
    WHERE "slug" = 'large-queensland-boulder-opal-teardrop-4-cts';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_mapping_status" = 'stale',
      "builder_mapping_version" = 4,
      "builder_mapping_notes" = NULL
    WHERE "slug" IN (
      'lightning-ridge-white-opal-1-05-cts',
      'lightning-ridge-white-opal-105-ct',
      'coober-pedy-carved-heart-1-ct',
      'large-queensland-boulder-opal-teardrop-4-cts'
    );
  `)
}
