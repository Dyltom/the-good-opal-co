import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const references = {
  aurora: [
    ['20210819_102625-1.jpg', 'aurora-ring-1', 'three-quarter'],
    ['20210819_102201.jpg', 'aurora-ring-2', 'three-quarter'],
  ],
  coral: [
    ['20210819_101746.jpg', 'coral-ring-2', 'three-quarter'],
    ['20210819_102402-1.jpg', 'coral-ring-2', 'top'],
    ['20210819_101705.jpg', 'coral-ring-2', 'three-quarter'],
    ['20210819_101509.jpg', 'coral-ring-1', 'three-quarter'],
    ['20210819_101524.jpg', 'coral-ring-1', 'top'],
    ['20210819_102831.jpg', 'coral-ring-1', 'three-quarter'],
  ],
  gemini: [
    ['20210819_101941.jpg', 'gemini-ring-2', 'three-quarter'],
    ['20210819_102417.jpg', 'gemini-ring-2', 'top'],
    ['20210819_102300.jpg', 'gemini-ring-1', 'three-quarter'],
    ['20210819_102712.jpg', 'gemini-ring-1', 'top'],
  ],
  'sun-moon': [
    ['20210819_102749.jpg', 'sun-and-moon-ring-1', 'top'],
    ['20210819_101835.jpg', 'sun-and-moon-ring-1', 'three-quarter'],
    ['20210819_102346.jpg', 'sun-and-moon-ring-2', 'three-quarter'],
  ],
} as const

function sourceReferences(style: keyof typeof references): string {
  return JSON.stringify(
    references[style].map(([filename, productSlug, view]) => ({
      assetPath: `/images/products/${filename}`,
      notes: 'Legacy sold-ring photograph. Useful visual evidence, not a calibrated capture.',
      productSlug,
      sourceType: 'product-gallery',
      view,
    }))
  )
}

const measurements = {
  aurora: {
    beadCount: 28,
    headLengthMm: 12.8,
    headWidthMm: 11.1,
    stoneLengthMm: 10,
    stoneWidthMm: 8,
  },
  coral: {
    headLengthMm: 11.25,
    headWidthMm: 11.25,
    stoneLengthMm: 10,
    stoneWidthMm: 10,
  },
  gemini: {
    headLengthMm: 10.75,
    headWidthMm: 8.75,
    stoneLengthMm: 10,
    stoneWidthMm: 8,
  },
  'sun-moon': {
    beadCount: 40,
    headLengthMm: 12.8,
    headWidthMm: 10.8,
    stoneLengthMm: 10,
    stoneWidthMm: 8,
  },
} as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_ring_designs_style" AS ENUM(
      'gemini', 'coral', 'sun-moon', 'aurora'
    );
    CREATE TYPE "public"."enum_ring_designs_status" AS ENUM(
      'draft', 'published', 'archived'
    );

    CREATE TABLE "ring_designs" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "style" "enum_ring_designs_style" NOT NULL,
      "status" "enum_ring_designs_status" DEFAULT 'draft' NOT NULL,
      "source_references" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "measurements" jsonb,
      "model_definition" jsonb,
      "maker_approved" boolean DEFAULT false,
      "approved_at" timestamp(3) with time zone,
      "approval_notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "ring_designs_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_ring_designs_fk"
      FOREIGN KEY ("ring_designs_id") REFERENCES "public"."ring_designs"("id")
      ON DELETE cascade ON UPDATE no action;

    CREATE UNIQUE INDEX "ring_designs_slug_idx" ON "ring_designs" ("slug");
    CREATE UNIQUE INDEX "ring_designs_style_idx" ON "ring_designs" ("style");
    CREATE INDEX "ring_designs_updated_at_idx" ON "ring_designs" ("updated_at");
    CREATE INDEX "ring_designs_created_at_idx" ON "ring_designs" ("created_at");
    CREATE INDEX "payload_locked_documents_rels_ring_designs_id_idx"
      ON "payload_locked_documents_rels" ("ring_designs_id");
  `)

  // Keep parameterized seed data in one prepared statement. node-postgres
  // rejects parameters when the same statement contains multiple SQL commands.
  await db.execute(sql`
    INSERT INTO "ring_designs"
      ("name", "slug", "style", "source_references", "measurements", "model_definition")
    VALUES
      (
        'Gemini',
        'gemini',
        'gemini',
        ${sourceReferences('gemini')}::jsonb,
        ${JSON.stringify(measurements.gemini)}::jsonb,
        '{"source":"procedural","version":"procedural-v1","notes":"Draft reconstruction from legacy face-on product photography."}'::jsonb
      ),
      (
        'Coral',
        'coral',
        'coral',
        ${sourceReferences('coral')}::jsonb,
        ${JSON.stringify(measurements.coral)}::jsonb,
        '{"source":"procedural","version":"procedural-v1","notes":"Draft reconstruction from legacy face-on product photography."}'::jsonb
      ),
      (
        'Sun & Moon',
        'sun-moon',
        'sun-moon',
        ${sourceReferences('sun-moon')}::jsonb,
        ${JSON.stringify(measurements['sun-moon'])}::jsonb,
        '{"source":"procedural","version":"procedural-v1","notes":"Draft reconstruction from legacy face-on product photography."}'::jsonb
      ),
      (
        'Aurora',
        'aurora',
        'aurora',
        ${sourceReferences('aurora')}::jsonb,
        ${JSON.stringify(measurements.aurora)}::jsonb,
        '{"source":"procedural","version":"procedural-v1","notes":"Draft reconstruction from legacy face-on product photography."}'::jsonb
      )
    ON CONFLICT ("slug") DO NOTHING;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_ring_designs_fk";
    DROP INDEX "payload_locked_documents_rels_ring_designs_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "ring_designs_id";
    DROP TABLE "ring_designs" CASCADE;
    DROP TYPE "public"."enum_ring_designs_status";
    DROP TYPE "public"."enum_ring_designs_style";
  `)
}
