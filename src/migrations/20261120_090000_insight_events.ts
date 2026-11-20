import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "insight_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "occurred_at" timestamp(3) with time zone NOT NULL,
      "path" varchar NOT NULL,
      "product_id" varchar,
      "value" numeric,
      "visitor" varchar,
      "landing_page" varchar,
      "referrer_host" varchar,
      "utm_source" varchar,
      "utm_medium" varchar,
      "utm_campaign" varchar,
      "country" varchar,
      "device" varchar,
      "browser" varchar,
      "detail" jsonb,
      "dedupe_key" varchar
    );

    CREATE INDEX "insight_events_name_idx" ON "insight_events" ("name");
    CREATE INDEX "insight_events_occurred_at_idx" ON "insight_events" ("occurred_at");
    CREATE INDEX "insight_events_product_id_idx" ON "insight_events" ("product_id");
    CREATE INDEX "insight_events_visitor_idx" ON "insight_events" ("visitor");
    CREATE UNIQUE INDEX "insight_events_dedupe_key_idx" ON "insight_events" ("dedupe_key");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE "insight_events" CASCADE;
  `)
}
