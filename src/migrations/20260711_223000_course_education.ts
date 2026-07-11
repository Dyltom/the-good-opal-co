import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_enquiries_type" ADD VALUE IF NOT EXISTS 'course-interest';

    CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published', 'archived');
    CREATE TYPE "public"."enum_courses_format" AS ENUM('online', 'live-online', 'in-person');
    CREATE TYPE "public"."enum_courses_level" AS ENUM('beginner', 'all-levels', 'intermediate');
    CREATE TYPE "public"."enum_courses_availability" AS ENUM('register-interest', 'coming-soon', 'closed');

    CREATE TABLE "courses_curriculum" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "summary" varchar NOT NULL,
      "topics" varchar
    );

    CREATE TABLE "courses_audience" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "item" varchar NOT NULL
    );

    CREATE TABLE "courses_outcomes" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "item" varchar NOT NULL
    );

    CREATE TABLE "courses" (
      "id" serial PRIMARY KEY NOT NULL,
      "legacy_word_press_id" numeric,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "summary" varchar NOT NULL,
      "introduction" varchar NOT NULL,
      "featured_image_id" integer,
      "status" "enum_courses_status" DEFAULT 'draft' NOT NULL,
      "published_at" timestamp(3) with time zone,
      "format" "enum_courses_format" DEFAULT 'online' NOT NULL,
      "level" "enum_courses_level" DEFAULT 'all-levels' NOT NULL,
      "duration" varchar,
      "availability" "enum_courses_availability" DEFAULT 'register-interest' NOT NULL,
      "instructor_name" varchar NOT NULL,
      "instructor_role" varchar,
      "instructor_bio" varchar,
      "tenant_id" varchar DEFAULT 'good-opal-co' NOT NULL,
      "meta_title" varchar,
      "meta_description" varchar,
      "meta_image_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "courses_id" integer;
    ALTER TABLE "courses_curriculum" ADD CONSTRAINT "courses_curriculum_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "courses_audience" ADD CONSTRAINT "courses_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "courses_outcomes" ADD CONSTRAINT "courses_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "courses" ADD CONSTRAINT "courses_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "courses" ADD CONSTRAINT "courses_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "courses_curriculum_order_idx" ON "courses_curriculum" USING btree ("_order");
    CREATE INDEX "courses_curriculum_parent_id_idx" ON "courses_curriculum" USING btree ("_parent_id");
    CREATE INDEX "courses_audience_order_idx" ON "courses_audience" USING btree ("_order");
    CREATE INDEX "courses_audience_parent_id_idx" ON "courses_audience" USING btree ("_parent_id");
    CREATE INDEX "courses_outcomes_order_idx" ON "courses_outcomes" USING btree ("_order");
    CREATE INDEX "courses_outcomes_parent_id_idx" ON "courses_outcomes" USING btree ("_parent_id");
    CREATE UNIQUE INDEX "courses_legacy_word_press_id_idx" ON "courses" USING btree ("legacy_word_press_id");
    CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
    CREATE INDEX "courses_featured_image_idx" ON "courses" USING btree ("featured_image_id");
    CREATE INDEX "courses_tenant_id_idx" ON "courses" USING btree ("tenant_id");
    CREATE INDEX "courses_meta_meta_image_idx" ON "courses" USING btree ("meta_image_id");
    CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
    CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
    CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");

    INSERT INTO "courses" (
      "title", "slug", "summary", "introduction", "status", "published_at",
      "format", "level", "availability", "instructor_name", "instructor_role",
      "instructor_bio", "tenant_id", "meta_title", "meta_description"
    ) VALUES (
      'The Complete Opal Cutting & Valuation Course',
      'complete-opal-cutting-valuation-course',
      'A practical online course covering opal anatomy, Australian opal types and origins, three cutting methods, polishing, and the factors used to value a finished stone.',
      'Steph created this course to make opal cutting knowledge more accessible to beginners. The public outline moves from understanding rough opal through sandpaper, rotary-tool, and cabbing-machine methods, then finishes with opal valuation.\n\nThis page records the verified course outline. Access timing, payment, support, and lesson availability are confirmed directly before any enrolment is offered.',
      'published',
      '2022-11-29T00:00:00.000Z',
      'online',
      'all-levels',
      'register-interest',
      'Stephanie Caruana',
      'Opal cutter',
      'Steph built the course around the information she wished had been easier to find when she began cutting opals.',
      'good-opal-co',
      'The Complete Opal Cutting & Valuation Course',
      'Explore the verified outline for Steph''s online course covering opal anatomy, cutting methods, polishing, and valuation.'
    );

    INSERT INTO "courses_curriculum" ("_order", "_parent_id", "id", "title", "summary", "topics") VALUES
      (1, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'course-introduction', 'Course introduction', 'Meet Steph and understand why the course was created.', 'Introduction to the course\nAbout Steph\nWhy the course was created'),
      (2, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'opal-anatomy', 'Module 1: Opal anatomy and Australian opal', 'Learn how opal forms, how to inspect rough, and how Australian types and fields differ.', 'Colour bars and potch\nHost rock and residual material\nInspecting opals\nCrystal, white, black, boulder, and matrix opal\nAustralian opal regions\nMexican and Ethiopian opal comparisons\nReview and quiz'),
      (3, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'sandpaper-method', 'Module 2: Cutting opal with sandpaper', 'Start with an accessible wet-sanding and polishing method.', 'Equipment and planning\nWet sanding with 600 grit\nWet sanding with 1200 grit\nPolishing\nTips and assignment'),
      (4, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'dremel-method', 'Module 3: Cutting opal with a rotary tool', 'Use a Dremel-style rotary tool to shape, refine, pre-polish, and finish opal safely.', 'Process overview\nRotary tool and resin tips\nSafety and handling\nRough shaping and backing\nDopstick and refinement\nPre-polish and glossy finish\nTips and assignment'),
      (5, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'cabbing-method', 'Module 4: Cutting opal with a cabbing machine', 'Move through machine setup, wheel selection, calibrated shapes, freeforms, and polishing.', 'Cabbing process and inspection\nPotch, host rock, and colour bar\nCutting for carat weight\nMachine operation and safety\nHard and soft wheels\nDopstick technique\nOval, round, cushion, marquise, and freeform shapes\nGlass-finish polish\nTips and assignment'),
      (6, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'opal-valuation', 'Module 5: Opal valuation', 'Assess the interacting characteristics that influence an opal''s value.', 'Market and rarity\nBody tone and brightness\nColour and pattern\nWeight and inclusions\nPlay of colour\nPrice per carat and overall cut\nMultipliers and detractors\nCase studies and test valuations\nReview and quiz'),
      (7, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'final-review', 'Course final review', 'Revisit the five modules and complete the final knowledge check.', 'Module recaps\nFinal quiz');

    INSERT INTO "courses_audience" ("_order", "_parent_id", "id", "item") VALUES
      (1, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'beginner-cutters', 'Beginners who want a structured introduction to opal cutting.'),
      (2, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'budget-methods', 'Learners comparing low-cost hand methods with rotary tools and cabbing machines.'),
      (3, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'valuation-learners', 'Collectors and makers who want a clearer framework for assessing opal value.');

    INSERT INTO "courses_outcomes" ("_order", "_parent_id", "id", "item") VALUES
      (1, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'inspect-rough', 'Inspect rough opal for colour bars, potch, host rock, and inclusions.'),
      (2, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'compare-types', 'Recognise major Australian opal types and producing regions.'),
      (3, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'compare-methods', 'Compare sandpaper, rotary-tool, and cabbing-machine workflows.'),
      (4, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'finish-opal', 'Plan shaping, refinement, pre-polish, and final polishing steps.'),
      (5, (SELECT "id" FROM "courses" WHERE "slug" = 'complete-opal-cutting-valuation-course'), 'value-opal', 'Evaluate brightness, body tone, colour, pattern, weight, inclusions, and cut together.');
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "payload_locked_documents_rels_courses_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_courses_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "courses_id";
    DROP TABLE "courses_curriculum" CASCADE;
    DROP TABLE "courses_audience" CASCADE;
    DROP TABLE "courses_outcomes" CASCADE;
    DROP TABLE "courses" CASCADE;
    DROP TYPE "public"."enum_courses_status";
    DROP TYPE "public"."enum_courses_format";
    DROP TYPE "public"."enum_courses_level";
    DROP TYPE "public"."enum_courses_availability";
  `)
}
