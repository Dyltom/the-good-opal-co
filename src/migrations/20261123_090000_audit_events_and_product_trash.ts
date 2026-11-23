import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_audit_events_how" AS ENUM('admin', 'api-key', 'system');
    CREATE TYPE "public"."enum_audit_events_action" AS ENUM('create', 'update', 'trash', 'restore', 'delete', 'login');
    CREATE TABLE "audit_events" (
      "id" serial PRIMARY KEY NOT NULL,
      "occurred_at" timestamp(3) with time zone NOT NULL,
      "user_id" integer,
      "user_email" varchar,
      "how" "enum_audit_events_how" NOT NULL,
      "action" "enum_audit_events_action" NOT NULL,
      "collection_slug" varchar NOT NULL,
      "document_id" varchar,
      "title" varchar,
      "changes" jsonb
    );
    ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX "audit_events_occurred_at_idx" ON "audit_events" USING btree ("occurred_at");
    CREATE INDEX "audit_events_user_idx" ON "audit_events" USING btree ("user_id");
    CREATE INDEX "audit_events_user_email_idx" ON "audit_events" USING btree ("user_email");
    CREATE INDEX "audit_events_action_idx" ON "audit_events" USING btree ("action");
    CREATE INDEX "audit_events_collection_slug_idx" ON "audit_events" USING btree ("collection_slug");
    CREATE INDEX "audit_events_document_id_idx" ON "audit_events" USING btree ("document_id");

    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp(3) with time zone;
    CREATE INDEX IF NOT EXISTS "products_deleted_at_idx" ON "products" USING btree ("deleted_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "products_deleted_at_idx";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "deleted_at";
    DROP TABLE IF EXISTS "audit_events" CASCADE;
    DROP TYPE IF EXISTS "public"."enum_audit_events_action";
    DROP TYPE IF EXISTS "public"."enum_audit_events_how";
  `)
}
