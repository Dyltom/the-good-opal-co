import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "ring_assets" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "notes" varchar,
      "sha256" varchar NOT NULL,
      "byte_length" numeric NOT NULL,
      "validation_version" varchar NOT NULL,
      "validated" boolean DEFAULT false NOT NULL,
      "node_names" jsonb NOT NULL,
      "material_names" jsonb NOT NULL,
      "bounds" jsonb NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ring_assets_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_ring_assets_fk"
      FOREIGN KEY ("ring_assets_id") REFERENCES "public"."ring_assets"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "ring_assets_sha256_idx" ON "ring_assets" ("sha256");
    CREATE INDEX "ring_assets_updated_at_idx" ON "ring_assets" ("updated_at");
    CREATE INDEX "ring_assets_created_at_idx" ON "ring_assets" ("created_at");
    CREATE UNIQUE INDEX "ring_assets_filename_idx" ON "ring_assets" ("filename");
    CREATE INDEX "payload_locked_documents_rels_ring_assets_id_idx"
      ON "payload_locked_documents_rels" ("ring_assets_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_ring_assets_fk";
    DROP INDEX "payload_locked_documents_rels_ring_assets_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ring_assets_id";
    DROP TABLE "ring_assets" CASCADE;
  `)
}
