import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 0.465
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 0.45
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 0.525
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 0.48
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 0.55
      END,
      "builder_photo_focal_y" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 0.52
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 0.52
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 0.52
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 0.48
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 0.48
      END,
      "builder_photo_zoom" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 10
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 8
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 6.5
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 6
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 5.5
      END,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Manually reviewed stone-only crop against selected source photography, 2026-07-14'
    WHERE "slug" IN (
      'lightning-ridge-black-opal-1-45-cts',
      'lightning-ridge-semi-black-opal-1-40-cts',
      'mintabie-semi-black-opal-6-80-cts',
      'coober-pedy-white-opal-2-30-cts-copy',
      'lightning-ridge-white-opal-1-70-cts-2'
    );

    UPDATE "products"
    SET
      "builder_silhouette" = 'cushion',
      "builder_recommended_style" = 'coral',
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Closest supported outline matched to selected source photography, 2026-07-14'
    WHERE "slug" IN (
      'lightning-ridge-black-opal-6-30ct',
      'mintabie-semi-black-opal-1-05-cts'
    );

    UPDATE "products"
    SET
      "builder_silhouette" = 'pear',
      "builder_recommended_style" = 'aurora',
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual'
    WHERE "slug" = 'mintabie-semi-black-opal-6-80-cts';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 0.5
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 0.5
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 0.5
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 0.43
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 0.505
      END,
      "builder_photo_focal_y" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 0.5
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 0.5
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 0.53
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 0.43
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 0.48
      END,
      "builder_photo_zoom" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-1-45-cts' THEN 4.75
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 4.75
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 3.75
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 4.6
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 3.8
      END,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = CASE "slug"
        WHEN 'coober-pedy-white-opal-2-30-cts-copy' THEN 'Live WebGL crop verified against catalogue photograph, 2026-07-14'
        WHEN 'lightning-ridge-white-opal-1-70-cts-2' THEN 'Top and three-quarter WebGL edge verified, 2026-07-14'
        ELSE 'Audited against selected catalogue photography, 2026-07-14'
      END
    WHERE "slug" IN (
      'lightning-ridge-black-opal-1-45-cts',
      'lightning-ridge-semi-black-opal-1-40-cts',
      'mintabie-semi-black-opal-6-80-cts',
      'coober-pedy-white-opal-2-30-cts-copy',
      'lightning-ridge-white-opal-1-70-cts-2'
    );

    UPDATE "products"
    SET
      "builder_silhouette" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 'pear'
        WHEN 'mintabie-semi-black-opal-1-05-cts' THEN 'oval'
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 'elongated'
      END,
      "builder_recommended_style" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 'aurora'
        WHEN 'mintabie-semi-black-opal-1-05-cts' THEN 'gemini'
        WHEN 'mintabie-semi-black-opal-6-80-cts' THEN 'gemini'
      END,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = CASE "slug"
        WHEN 'mintabie-semi-black-opal-1-05-cts' THEN NULL
        ELSE 'Audited against selected catalogue photography, 2026-07-14'
      END
    WHERE "slug" IN (
      'lightning-ridge-black-opal-6-30ct',
      'mintabie-semi-black-opal-1-05-cts',
      'mintabie-semi-black-opal-6-80-cts'
    );
  `)
}
