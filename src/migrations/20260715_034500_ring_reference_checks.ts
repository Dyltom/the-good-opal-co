import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_ring_reference_checks_outcome" AS ENUM(
      'available', 'redirected', 'not-found', 'rate-limited', 'blocked', 'error'
    );

    CREATE TABLE "ring_reference_checks" (
      "id" serial PRIMARY KEY NOT NULL,
      "check_key" varchar NOT NULL,
      "ring_design_id" integer,
      "candidate_key" varchar,
      "source_url" varchar NOT NULL,
      "account_handle" varchar NOT NULL,
      "shortcode" varchar NOT NULL,
      "checked_at" timestamp(3) with time zone NOT NULL,
      "outcome" "enum_ring_reference_checks_outcome" NOT NULL,
      "http_status" numeric,
      "resolved_url" varchar,
      "duration_ms" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "ring_reference_checks_target_check" CHECK (
        ("ring_design_id" IS NOT NULL AND "candidate_key" IS NULL)
        OR
        (
          "ring_design_id" IS NULL
          AND "candidate_key" IS NOT NULL
          AND length(btrim("candidate_key")) > 0
        )
      )
    );

    ALTER TABLE "ring_reference_checks"
      ADD CONSTRAINT "ring_reference_checks_ring_design_id_ring_designs_id_fk"
      FOREIGN KEY ("ring_design_id") REFERENCES "public"."ring_designs"("id")
      ON DELETE restrict ON UPDATE no action;

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN "ring_reference_checks_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_ring_reference_checks_fk"
      FOREIGN KEY ("ring_reference_checks_id")
      REFERENCES "public"."ring_reference_checks"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "ring_reference_checks_check_key_idx"
      ON "ring_reference_checks" ("check_key");
    CREATE INDEX "ring_reference_checks_ring_design_idx"
      ON "ring_reference_checks" ("ring_design_id");
    CREATE INDEX "ring_reference_checks_candidate_key_idx"
      ON "ring_reference_checks" ("candidate_key");
    CREATE INDEX "ring_reference_checks_shortcode_idx"
      ON "ring_reference_checks" ("shortcode");
    CREATE INDEX "ring_reference_checks_checked_at_idx"
      ON "ring_reference_checks" ("checked_at");
    CREATE INDEX "ring_reference_checks_updated_at_idx"
      ON "ring_reference_checks" ("updated_at");
    CREATE INDEX "ring_reference_checks_created_at_idx"
      ON "ring_reference_checks" ("created_at");
    CREATE INDEX "payload_locked_documents_rels_ring_reference_checks_id_idx"
      ON "payload_locked_documents_rels" ("ring_reference_checks_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_ring_reference_checks_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_ring_reference_checks_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ring_reference_checks_id";
    DROP TABLE "ring_reference_checks" CASCADE;
    DROP TYPE "public"."enum_ring_reference_checks_outcome";
  `)
}
