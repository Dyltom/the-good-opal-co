import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "builder_contour" jsonb,
      ADD COLUMN IF NOT EXISTS "builder_contour_candidate" jsonb,
      ADD COLUMN IF NOT EXISTS "builder_contour_source_image_hash" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "builder_contour_source_image_hash",
      DROP COLUMN IF EXISTS "builder_contour_candidate",
      DROP COLUMN IF EXISTS "builder_contour";
  `)
}
