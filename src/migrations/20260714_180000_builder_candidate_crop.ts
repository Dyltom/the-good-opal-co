import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "builder_photo_candidate_focal_x" numeric,
      ADD COLUMN IF NOT EXISTS "builder_photo_candidate_focal_y" numeric,
      ADD COLUMN IF NOT EXISTS "builder_photo_candidate_zoom" numeric,
      ADD COLUMN IF NOT EXISTS "builder_photo_candidate_rotation" numeric;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "builder_photo_candidate_rotation",
      DROP COLUMN IF EXISTS "builder_photo_candidate_zoom",
      DROP COLUMN IF EXISTS "builder_photo_candidate_focal_y",
      DROP COLUMN IF EXISTS "builder_photo_candidate_focal_x";
  `)
}
