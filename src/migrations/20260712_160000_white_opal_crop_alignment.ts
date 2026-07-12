import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.507,
      "builder_photo_focal_y" = 0.415,
      "builder_photo_zoom" = 3.62,
      "builder_mapping_status" = 'manual',
      "builder_mapping_version" = 4,
      "builder_mapping_reviewed_at" = NOW(),
      "builder_mapping_notes" = 'Stone-only crop removes photographed bench from 3D cabochon, 2026-07-12'
    WHERE "slug" IN (
      'lightning-ridge-white-opal-1-05-cts',
      'lightning-ridge-white-opal-105-ct'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_photo_focal_x" = 0.507,
      "builder_photo_focal_y" = 0.495,
      "builder_photo_zoom" = 3.08,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_version" = 3,
      "builder_mapping_notes" = NULL
    WHERE "slug" IN (
      'lightning-ridge-white-opal-1-05-cts',
      'lightning-ridge-white-opal-105-ct'
    );
  `)
}
