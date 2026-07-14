import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const slug = 'mintabie-semi-black-opal-1-05-cts'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.524,
      "builder_photo_focal_y" = 0.519,
      "builder_photo_zoom" = 6.3,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Cushion crop manually verified inside selected source-photo stone pixels, 2026-07-14'
    WHERE "slug" = ${slug};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.504,
      "builder_photo_focal_y" = 0.487,
      "builder_photo_zoom" = 4.81,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Closest supported outline matched to selected source photography, 2026-07-14'
    WHERE "slug" = ${slug};
  `)
}
