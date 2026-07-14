import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const slug = 'lightning-ridge-white-opal-1-70-cts-2'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.505,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Top and three-quarter WebGL edge verified, 2026-07-14'
    WHERE "slug" = ${slug};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.47,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Reverted to first live WebGL crop correction, 2026-07-14'
    WHERE "slug" = ${slug};
  `)
}
