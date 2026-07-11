import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "builder_eligible" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "builder_silhouette" varchar,
      ADD COLUMN IF NOT EXISTS "builder_recommended_style" varchar,
      ADD COLUMN IF NOT EXISTS "builder_body_colour" varchar,
      ADD COLUMN IF NOT EXISTS "builder_flash_colour_primary" varchar,
      ADD COLUMN IF NOT EXISTS "builder_flash_colour_secondary" varchar,
      ADD COLUMN IF NOT EXISTS "builder_flash_colour_accent" varchar,
      ADD COLUMN IF NOT EXISTS "builder_transmission" numeric,
      ADD COLUMN IF NOT EXISTS "builder_photo_focal_x" numeric,
      ADD COLUMN IF NOT EXISTS "builder_photo_focal_y" numeric,
      ADD COLUMN IF NOT EXISTS "builder_photo_zoom" numeric,
      ADD COLUMN IF NOT EXISTS "weight_unit" varchar;

    UPDATE "products"
    SET
      "builder_eligible" = true,
      "builder_silhouette" = 'oval',
      "builder_recommended_style" = 'gemini',
      "builder_body_colour" = '#d7dcc9',
      "builder_flash_colour_primary" = '#55cfff',
      "builder_flash_colour_secondary" = '#5bea9a',
      "builder_flash_colour_accent" = '#ffd34e',
      "builder_transmission" = 0.16,
      "builder_photo_focal_x" = 0.507,
      "builder_photo_focal_y" = 0.495,
      "builder_photo_zoom" = 3.08,
      "dimensions_width" = 6,
      "dimensions_length" = 7,
      "dimensions_depth" = 3
    WHERE "slug" IN (
      'lightning-ridge-white-opal-1-05-cts',
      'lightning-ridge-white-opal-105-ct'
    );

    UPDATE "products"
    SET
      "builder_eligible" = true,
      "builder_silhouette" = 'oval',
      "builder_recommended_style" = 'gemini',
      "builder_body_colour" = '#a8c4b8',
      "builder_flash_colour_primary" = '#6fe1ff',
      "builder_flash_colour_secondary" = '#79f0ad',
      "builder_flash_colour_accent" = '#ffd85a',
      "builder_transmission" = 0.08,
      "builder_photo_focal_x" = 0.504,
      "builder_photo_focal_y" = 0.487,
      "builder_photo_zoom" = 4.81,
      "dimensions_width" = 5,
      "dimensions_length" = 6.5,
      "dimensions_depth" = 3.5
    WHERE "slug" IN (
      'mintabie-semi-black-opal-1-05-cts',
      'mintabie-semi-black-opal-105-cts'
    );

    UPDATE "products"
    SET
      "builder_eligible" = true,
      "builder_silhouette" = 'oval',
      "builder_recommended_style" = 'gemini',
      "builder_body_colour" = '#cbd5c7',
      "builder_flash_colour_primary" = '#55cfff',
      "builder_flash_colour_secondary" = '#5bea9a',
      "builder_flash_colour_accent" = '#ff758a',
      "builder_transmission" = 0.08,
      "builder_photo_focal_x" = 0.501,
      "builder_photo_focal_y" = 0.493,
      "builder_photo_zoom" = 3.61,
      "dimensions_width" = 7,
      "dimensions_length" = 8,
      "dimensions_depth" = 3.5
    WHERE "slug" IN (
      'mintabie-semi-black-opal-1-35-cts',
      'mintabie-semi-black-opal-135-cts'
    );

    UPDATE "products"
    SET
      "builder_eligible" = true,
      "builder_silhouette" = 'elongated',
      "builder_recommended_style" = 'gemini',
      "builder_body_colour" = '#78c5df',
      "builder_flash_colour_primary" = '#25d5e7',
      "builder_flash_colour_secondary" = '#4bef9a',
      "builder_flash_colour_accent" = '#4169ff',
      "builder_transmission" = 0.26,
      "builder_photo_focal_x" = 0.517,
      "builder_photo_focal_y" = 0.466,
      "builder_photo_zoom" = 4.74,
      "dimensions_width" = 5.3,
      "dimensions_length" = 9.5,
      "dimensions_depth" = 2.5
    WHERE "slug" IN (
      'queensland-crystal-pipe-opal-1-45-cts',
      'queensland-crystal-pipe-opal-105-cts'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "weight_unit",
      DROP COLUMN IF EXISTS "builder_photo_zoom",
      DROP COLUMN IF EXISTS "builder_photo_focal_y",
      DROP COLUMN IF EXISTS "builder_photo_focal_x",
      DROP COLUMN IF EXISTS "builder_transmission",
      DROP COLUMN IF EXISTS "builder_flash_colour_accent",
      DROP COLUMN IF EXISTS "builder_flash_colour_secondary",
      DROP COLUMN IF EXISTS "builder_flash_colour_primary",
      DROP COLUMN IF EXISTS "builder_body_colour",
      DROP COLUMN IF EXISTS "builder_recommended_style",
      DROP COLUMN IF EXISTS "builder_silhouette",
      DROP COLUMN IF EXISTS "builder_eligible";
  `)
}
