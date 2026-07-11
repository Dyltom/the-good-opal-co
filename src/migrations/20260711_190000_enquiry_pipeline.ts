import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_enquiries_type" AS ENUM(
      'general', 'custom-design', 'virtual-viewing', 'product-question',
      'order-support', 'returns', 'wholesale'
    );
    CREATE TYPE "public"."enum_enquiries_status" AS ENUM(
      'new', 'reviewing', 'awaiting-customer', 'consultation', 'quoted',
      'accepted', 'deposit-paid', 'in-production', 'completed', 'declined', 'spam'
    );
    CREATE TYPE "public"."enum_enquiries_source" AS ENUM(
      'website-contact', 'custom-builder', 'manual'
    );

    CREATE TABLE "enquiries" (
      "id" serial PRIMARY KEY NOT NULL,
      "reference" varchar NOT NULL,
      "type" "enum_enquiries_type" NOT NULL,
      "status" "enum_enquiries_status" DEFAULT 'new' NOT NULL,
      "name" varchar NOT NULL,
      "email" varchar NOT NULL,
      "phone" varchar,
      "order_number" varchar,
      "product" varchar,
      "budget" varchar,
      "timeline" varchar,
      "message" varchar NOT NULL,
      "design_configuration" jsonb,
      "source" "enum_enquiries_source" DEFAULT 'website-contact' NOT NULL,
      "submitted_at" timestamp(3) with time zone NOT NULL,
      "owner_email_sent_at" timestamp(3) with time zone,
      "customer_email_sent_at" timestamp(3) with time zone,
      "email_delivery_error" varchar,
      "internal_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk"
      FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "enquiries_reference_idx" ON "enquiries" USING btree ("reference");
    CREATE INDEX "enquiries_email_idx" ON "enquiries" USING btree ("email");
    CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
    CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
    CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx"
      ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
    DROP TABLE "enquiries" CASCADE;
    DROP TYPE "public"."enum_enquiries_source";
    DROP TYPE "public"."enum_enquiries_status";
    DROP TYPE "public"."enum_enquiries_type";
  `)
}
