import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const slug = 'coober-pedy-white-opal-2-30-cts-copy'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.43,
      "builder_photo_focal_y" = 0.43,
      "builder_photo_zoom" = 4.6,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Live WebGL crop verified against catalogue photograph, 2026-07-14'
    WHERE "slug" = ${slug};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.372,
      "builder_photo_focal_y" = 0.506,
      "builder_photo_zoom" = 6.12,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Reverted to initial catalogue crop audit, 2026-07-14'
    WHERE "slug" = ${slug};
  `)
}
