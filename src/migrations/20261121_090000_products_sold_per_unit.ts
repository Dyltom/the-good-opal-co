import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_products_stone_type" ADD VALUE IF NOT EXISTS 'opal-triplet';
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "sold_per_unit" boolean DEFAULT false;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "sold_per_unit";
    ALTER TABLE "products" ALTER COLUMN "stone_type" SET DATA TYPE text;
    UPDATE "products" SET "stone_type" = 'opal-doublet' WHERE "stone_type" = 'opal-triplet';
    DROP TYPE "public"."enum_products_stone_type";
    CREATE TYPE "public"."enum_products_stone_type" AS ENUM('black-opal', 'white-opal', 'boulder-opal', 'crystal-opal', 'fire-opal', 'matrix-opal', 'opal-doublet');
    ALTER TABLE "products" ALTER COLUMN "stone_type" SET DATA TYPE "public"."enum_products_stone_type" USING "stone_type"::"public"."enum_products_stone_type";
  `)
}
