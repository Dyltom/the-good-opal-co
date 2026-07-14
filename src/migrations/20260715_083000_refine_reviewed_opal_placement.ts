import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const mintabieSlug = 'mintabie-semi-black-opal-1-05-cts'
const cooberPedySlug = 'coober-pedy-white-opal-2-30-cts-copy'

/**
 * Applies the two placement corrections confirmed against the owned catalogue
 * source photos. Other automatic contour candidates stay pending maker review.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.515,
      "builder_photo_focal_y" = 0.49,
      "builder_photo_zoom" = 7,
      "builder_photo_rotation" = 0,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Stone-only crop verified against selected catalogue source, 2026-07-15'
    WHERE "slug" = ${mintabieSlug};
  `)
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_silhouette" = 'pear',
      "builder_recommended_style" = 'aurora',
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Tapered pear outline verified against selected catalogue source, 2026-07-15'
    WHERE "slug" = ${cooberPedySlug};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.524,
      "builder_photo_focal_y" = 0.519,
      "builder_photo_zoom" = 6.3,
      "builder_photo_rotation" = 0,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Cushion crop manually verified inside selected source-photo stone pixels, 2026-07-14'
    WHERE "slug" = ${mintabieSlug};
  `)
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_silhouette" = 'oval',
      "builder_recommended_style" = 'gemini',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Live WebGL crop verified against catalogue photograph, 2026-07-14'
    WHERE "slug" = ${cooberPedySlug};
  `)
}
