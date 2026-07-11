import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "material" = COALESCE("material", 'none'),
      "weight_unit" = CASE
        WHEN "weight" IS NOT NULL THEN COALESCE("weight_unit", 'carats')
        ELSE "weight_unit"
      END
    WHERE "category" = 'raw-opals';

    UPDATE "products"
    SET
      "material" = 'sterling-silver',
      "dimensions_length" = 10,
      "dimensions_width" = 8,
      "ring_size" = '8'
    WHERE "slug" = 'gemini-ring-2';

    UPDATE "products"
    SET
      "material" = 'sterling-silver',
      "dimensions_length" = 10,
      "dimensions_width" = 8,
      "ring_size" = '7'
    WHERE "slug" = 'gemini-ring-1';

    UPDATE "products"
    SET
      "material" = 'sterling-silver',
      "dimensions_length" = 10,
      "dimensions_width" = 10,
      "ring_size" = '6.5'
    WHERE "slug" = 'coral-ring-2';

    UPDATE "products"
    SET
      "material" = 'sterling-silver',
      "dimensions_length" = 10,
      "dimensions_width" = 10,
      "ring_size" = '8'
    WHERE "slug" = 'coral-ring-1';

    UPDATE "products"
    SET
      "material" = 'sterling-silver',
      "dimensions_length" = 10,
      "dimensions_width" = 8,
      "ring_size" = '7'
    WHERE "slug" = 'sun-and-moon-ring-1';

    UPDATE "products"
    SET "stone_type" = 'crystal-opal', "stone_origin" = 'coober-pedy'
    WHERE "slug" = 'crystalopal-earrings-bouquet-studs';

    UPDATE "products"
    SET "stone_type" = 'opal-doublet', "stone_origin" = 'lightning-ridge'
    WHERE "slug" = 'doublet-opal-earrings-bouquet-studs';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET "material" = NULL, "weight_unit" = NULL
    WHERE "category" = 'raw-opals';

    UPDATE "products"
    SET
      "material" = NULL,
      "dimensions_length" = NULL,
      "dimensions_width" = NULL,
      "ring_size" = NULL
    WHERE "slug" IN (
      'gemini-ring-2',
      'gemini-ring-1',
      'coral-ring-2',
      'coral-ring-1',
      'sun-and-moon-ring-1'
    );

    UPDATE "products"
    SET "stone_type" = NULL, "stone_origin" = NULL
    WHERE "slug" IN (
      'crystalopal-earrings-bouquet-studs',
      'doublet-opal-earrings-bouquet-studs'
    );
  `)
}
