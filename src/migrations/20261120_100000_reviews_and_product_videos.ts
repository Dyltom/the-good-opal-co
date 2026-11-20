import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_reviews_status" AS ENUM('draft', 'published');

    CREATE TABLE "reviews" (
      "id" serial PRIMARY KEY NOT NULL,
      "author_name" varchar NOT NULL,
      "body" varchar NOT NULL,
      "rating" numeric,
      "reviewed_at" timestamp(3) with time zone NOT NULL,
      "source" varchar NOT NULL,
      "source_url" varchar,
      "product_id" integer,
      "status" "enum_reviews_status" DEFAULT 'draft' NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "reviews"
      ADD CONSTRAINT "reviews_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id")
      ON DELETE set null ON UPDATE no action;

    CREATE INDEX "reviews_product_idx" ON "reviews" ("product_id");
    CREATE INDEX "reviews_updated_at_idx" ON "reviews" ("updated_at");
    CREATE INDEX "reviews_created_at_idx" ON "reviews" ("created_at");

    CREATE TABLE "products_videos" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "video_id" integer NOT NULL,
      "poster_id" integer
    );

    ALTER TABLE "products_videos"
      ADD CONSTRAINT "products_videos_video_id_media_id_fk"
      FOREIGN KEY ("video_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
    ALTER TABLE "products_videos"
      ADD CONSTRAINT "products_videos_poster_id_media_id_fk"
      FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;
    ALTER TABLE "products_videos"
      ADD CONSTRAINT "products_videos_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "products_videos_order_idx" ON "products_videos" ("_order");
    CREATE INDEX "products_videos_parent_id_idx" ON "products_videos" ("_parent_id");
    CREATE INDEX "products_videos_video_idx" ON "products_videos" ("video_id");
    CREATE INDEX "products_videos_poster_idx" ON "products_videos" ("poster_id");

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reviews_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_reviews_fk"
      FOREIGN KEY ("reviews_id") REFERENCES "public"."reviews"("id")
      ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_reviews_id_idx"
      ON "payload_locked_documents_rels" ("reviews_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_reviews_fk";
    DROP INDEX "payload_locked_documents_rels_reviews_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reviews_id";
    DROP TABLE "products_videos" CASCADE;
    DROP TABLE "reviews" CASCADE;
    DROP TYPE "public"."enum_reviews_status";
  `)
}
