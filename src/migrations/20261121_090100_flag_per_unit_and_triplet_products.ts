import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products" SET "sold_per_unit" = true
    WHERE "legacy_woo_id" IN (5181, 5302, 5304, 5305);
    UPDATE "products" SET "stone_type" = 'opal-triplet'
    WHERE "legacy_woo_id" = 4864 AND "stone_type" = 'opal-doublet';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products" SET "sold_per_unit" = false
    WHERE "legacy_woo_id" IN (5181, 5302, 5304, 5305);
    UPDATE "products" SET "stone_type" = 'opal-doublet'
    WHERE "legacy_woo_id" = 4864 AND "stone_type" = 'opal-triplet';
  `)
}
