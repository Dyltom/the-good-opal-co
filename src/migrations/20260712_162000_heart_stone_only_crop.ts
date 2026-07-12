import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.5,
      "builder_photo_focal_y" = 0.56,
      "builder_photo_zoom" = 3.2,
      "builder_mapping_status" = 'manual',
      "builder_mapping_version" = 6,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Chrome-verified heart interior crop removes photographed background from notch, 2026-07-12'
    WHERE "slug" = 'coober-pedy-carved-heart-1-ct';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.5,
      "builder_photo_focal_y" = 0.51,
      "builder_photo_zoom" = 2.5,
      "builder_mapping_status" = 'manual',
      "builder_mapping_version" = 5,
      "builder_mapping_notes" = 'Chrome-verified carved-heart crop and contour, 2026-07-12'
    WHERE "slug" = 'coober-pedy-carved-heart-1-ct';
  `)
}
