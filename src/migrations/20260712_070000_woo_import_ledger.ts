import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_commerce_import_runs_mode" AS ENUM('initial', 'final-delta');
    CREATE TYPE "public"."enum_commerce_import_runs_status" AS ENUM(
      'running', 'completed', 'failed'
    );

    CREATE TABLE "commerce_import_runs" (
      "id" serial PRIMARY KEY NOT NULL,
      "run_id" varchar NOT NULL,
      "mode" "enum_commerce_import_runs_mode" NOT NULL,
      "status" "enum_commerce_import_runs_status" NOT NULL,
      "deployment_id" varchar,
      "started_at" timestamp(3) with time zone NOT NULL,
      "completed_at" timestamp(3) with time zone,
      "failed_at" timestamp(3) with time zone,
      "summary" jsonb,
      "error" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN "commerce_import_runs_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_commerce_import_runs_fk"
      FOREIGN KEY ("commerce_import_runs_id")
      REFERENCES "public"."commerce_import_runs"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "commerce_import_runs_run_id_idx"
      ON "commerce_import_runs" USING btree ("run_id");
    CREATE INDEX "commerce_import_runs_updated_at_idx"
      ON "commerce_import_runs" USING btree ("updated_at");
    CREATE INDEX "commerce_import_runs_created_at_idx"
      ON "commerce_import_runs" USING btree ("created_at");
    CREATE INDEX "payload_locked_documents_rels_commerce_import_runs_id_idx"
      ON "payload_locked_documents_rels" USING btree ("commerce_import_runs_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_commerce_import_runs_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_commerce_import_runs_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "commerce_import_runs_id";
    DROP TABLE "commerce_import_runs" CASCADE;
    DROP TYPE "public"."enum_commerce_import_runs_status";
    DROP TYPE "public"."enum_commerce_import_runs_mode";
  `)
}
