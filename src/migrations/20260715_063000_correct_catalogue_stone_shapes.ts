import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

/**
 * Aligns reviewed builder metadata with the visible outline in the owned
 * catalogue photographs. Only silhouette and compatible design change; crop
 * placement and manual-review protection remain untouched.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_silhouette" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 'pear'
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 'elongated'
        WHEN 'coober-pedy-white-opal-6-35-cts' THEN 'cushion'
        WHEN 'queensland-boulder-opal-20-cts' THEN 'cushion'
      END,
      "builder_recommended_style" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 'aurora'
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 'gemini'
        WHEN 'coober-pedy-white-opal-6-35-cts' THEN 'coral'
        WHEN 'queensland-boulder-opal-20-cts' THEN 'coral'
      END,
      "builder_mapping_status" = 'reviewed',
      "builder_mapping_mode" = 'manual',
      "builder_mapping_reviewed_at" = NOW()
    WHERE "slug" IN (
      'lightning-ridge-black-opal-6-30ct',
      'lightning-ridge-semi-black-opal-1-40-cts',
      'coober-pedy-white-opal-6-35-cts',
      'queensland-boulder-opal-20-cts'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET
      "builder_silhouette" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 'pear'
        WHEN 'lightning-ridge-semi-black-opal-1-40-cts' THEN 'oval'
        WHEN 'coober-pedy-white-opal-6-35-cts' THEN 'oval'
        WHEN 'queensland-boulder-opal-20-cts' THEN 'oval'
      END,
      "builder_recommended_style" = CASE "slug"
        WHEN 'lightning-ridge-black-opal-6-30ct' THEN 'aurora'
        ELSE 'gemini'
      END,
      "builder_mapping_reviewed_at" = NOW()
    WHERE "slug" IN (
      'lightning-ridge-black-opal-6-30ct',
      'lightning-ridge-semi-black-opal-1-40-cts',
      'coober-pedy-white-opal-6-35-cts',
      'queensland-boulder-opal-20-cts'
    );
  `)
}
