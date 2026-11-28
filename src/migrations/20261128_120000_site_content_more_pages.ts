import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_hero_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_hero_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_hero_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_hero_image1_image_id" integer;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_hero_image1_alt" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_hero_image2_image_id" integer;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_hero_image2_alt" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_course_image1_image_id" integer;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_course_image1_alt" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_course_image2_image_id" integer;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "courses_course_image2_alt" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_hero_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_hero_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_hero_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_hero_image_image_id" integer;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_hero_image_alt" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_closing_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_closing_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_closing_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_closing_image_image_id" integer;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "faq_closing_image_alt" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gift_vouchers_hero_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gift_vouchers_hero_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gift_vouchers_hero_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_hero_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_hero_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_hero_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_closing_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_closing_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_closing_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_closing_image_image_id" integer;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "gifts_closing_image_alt" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "contact_hero_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "contact_hero_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "contact_hero_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "blog_hero_heading_text" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "blog_hero_heading_italic" varchar;
    ALTER TABLE "site_content" ADD COLUMN IF NOT EXISTS "blog_hero_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_hero_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_hero_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_hero_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_hero_image1_image_id" integer;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_hero_image1_alt" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_hero_image2_image_id" integer;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_hero_image2_alt" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_course_image1_image_id" integer;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_course_image1_alt" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_course_image2_image_id" integer;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_courses_course_image2_alt" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_hero_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_hero_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_hero_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_hero_image_image_id" integer;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_hero_image_alt" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_closing_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_closing_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_closing_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_closing_image_image_id" integer;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_faq_closing_image_alt" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gift_vouchers_hero_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gift_vouchers_hero_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gift_vouchers_hero_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_hero_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_hero_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_hero_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_closing_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_closing_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_closing_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_closing_image_image_id" integer;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_gifts_closing_image_alt" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_contact_hero_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_contact_hero_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_contact_hero_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_blog_hero_heading_text" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_blog_hero_heading_italic" varchar;
    ALTER TABLE "_site_content_v" ADD COLUMN IF NOT EXISTS "version_blog_hero_text" varchar;
    CREATE TABLE IF NOT EXISTS "site_content_courses_pillars" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "title" varchar,
      "body" varchar
    );
    CREATE TABLE IF NOT EXISTS "site_content_faq_questions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "category" varchar,
      "question" varchar,
      "answer" varchar
    );
    CREATE TABLE IF NOT EXISTS "_site_content_v_version_courses_pillars" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar,
      "body" varchar,
      "_uuid" varchar
    );
    CREATE TABLE IF NOT EXISTS "_site_content_v_version_faq_questions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "category" varchar,
      "question" varchar,
      "answer" varchar,
      "_uuid" varchar
    );
    DO $$ BEGIN
      ALTER TABLE "site_content_courses_pillars" ADD CONSTRAINT "site_content_courses_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content_faq_questions" ADD CONSTRAINT "site_content_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_content"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content" ADD CONSTRAINT "site_content_courses_hero_image1_image_id_media_id_fk" FOREIGN KEY ("courses_hero_image1_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content" ADD CONSTRAINT "site_content_courses_hero_image2_image_id_media_id_fk" FOREIGN KEY ("courses_hero_image2_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content" ADD CONSTRAINT "site_content_courses_course_image1_image_id_media_id_fk" FOREIGN KEY ("courses_course_image1_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content" ADD CONSTRAINT "site_content_courses_course_image2_image_id_media_id_fk" FOREIGN KEY ("courses_course_image2_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content" ADD CONSTRAINT "site_content_faq_hero_image_image_id_media_id_fk" FOREIGN KEY ("faq_hero_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content" ADD CONSTRAINT "site_content_faq_closing_image_image_id_media_id_fk" FOREIGN KEY ("faq_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "site_content" ADD CONSTRAINT "site_content_gifts_closing_image_image_id_media_id_fk" FOREIGN KEY ("gifts_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v_version_courses_pillars" ADD CONSTRAINT "_site_content_v_version_courses_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v_version_faq_questions" ADD CONSTRAINT "_site_content_v_version_faq_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_content_v"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_courses_hero_image1_image_id_media_id_f" FOREIGN KEY ("version_courses_hero_image1_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_courses_hero_image2_image_id_media_id_f" FOREIGN KEY ("version_courses_hero_image2_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_courses_course_image1_image_id_media_id" FOREIGN KEY ("version_courses_course_image1_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_courses_course_image2_image_id_media_id" FOREIGN KEY ("version_courses_course_image2_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_faq_hero_image_image_id_media_id_fk" FOREIGN KEY ("version_faq_hero_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_faq_closing_image_image_id_media_id_fk" FOREIGN KEY ("version_faq_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    DO $$ BEGIN
      ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_gifts_closing_image_image_id_media_id_f" FOREIGN KEY ("version_gifts_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
    CREATE INDEX IF NOT EXISTS "site_content_courses_pillars_order_idx" ON "site_content_courses_pillars" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_content_courses_pillars_parent_id_idx" ON "site_content_courses_pillars" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_content_faq_questions_order_idx" ON "site_content_faq_questions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "site_content_faq_questions_parent_id_idx" ON "site_content_faq_questions" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "site_content_courses_hero_image1_courses_hero_image1_ima_idx" ON "site_content" USING btree ("courses_hero_image1_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_courses_hero_image2_courses_hero_image2_ima_idx" ON "site_content" USING btree ("courses_hero_image2_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_courses_course_image1_courses_course_image1_idx" ON "site_content" USING btree ("courses_course_image1_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_courses_course_image2_courses_course_image2_idx" ON "site_content" USING btree ("courses_course_image2_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_faq_hero_image_faq_hero_image_image_idx" ON "site_content" USING btree ("faq_hero_image_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_faq_closing_image_faq_closing_image_image_idx" ON "site_content" USING btree ("faq_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_gifts_closing_image_gifts_closing_image_ima_idx" ON "site_content" USING btree ("gifts_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_courses_pillars_order_idx" ON "_site_content_v_version_courses_pillars" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_courses_pillars_parent_id_idx" ON "_site_content_v_version_courses_pillars" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_faq_questions_order_idx" ON "_site_content_v_version_faq_questions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_faq_questions_parent_id_idx" ON "_site_content_v_version_faq_questions" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_courses_hero_image1_version_cour_idx" ON "_site_content_v" USING btree ("version_courses_hero_image1_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_courses_hero_image2_version_cour_idx" ON "_site_content_v" USING btree ("version_courses_hero_image2_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_courses_course_image1_version_co_idx" ON "_site_content_v" USING btree ("version_courses_course_image1_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_courses_course_image2_version_co_idx" ON "_site_content_v" USING btree ("version_courses_course_image2_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_faq_hero_image_version_faq_hero__idx" ON "_site_content_v" USING btree ("version_faq_hero_image_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_faq_closing_image_version_faq_cl_idx" ON "_site_content_v" USING btree ("version_faq_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_gifts_closing_image_version_gift_idx" ON "_site_content_v" USING btree ("version_gifts_closing_image_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_site_content_v_version_courses_pillars" CASCADE;
    DROP TABLE IF EXISTS "_site_content_v_version_faq_questions" CASCADE;
    DROP TABLE IF EXISTS "site_content_courses_pillars" CASCADE;
    DROP TABLE IF EXISTS "site_content_faq_questions" CASCADE;
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_hero_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_hero_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_hero_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_hero_image1_image_id";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_hero_image1_alt";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_hero_image2_image_id";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_hero_image2_alt";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_course_image1_image_id";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_course_image1_alt";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_course_image2_image_id";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_courses_course_image2_alt";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_hero_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_hero_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_hero_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_hero_image_image_id";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_hero_image_alt";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_closing_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_closing_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_closing_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_closing_image_image_id";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_faq_closing_image_alt";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gift_vouchers_hero_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gift_vouchers_hero_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gift_vouchers_hero_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_hero_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_hero_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_hero_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_closing_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_closing_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_closing_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_closing_image_image_id";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_gifts_closing_image_alt";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_contact_hero_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_contact_hero_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_contact_hero_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_blog_hero_heading_text";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_blog_hero_heading_italic";
    ALTER TABLE "_site_content_v" DROP COLUMN IF EXISTS "version_blog_hero_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_hero_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_hero_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_hero_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_hero_image1_image_id";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_hero_image1_alt";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_hero_image2_image_id";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_hero_image2_alt";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_course_image1_image_id";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_course_image1_alt";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_course_image2_image_id";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "courses_course_image2_alt";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_hero_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_hero_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_hero_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_hero_image_image_id";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_hero_image_alt";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_closing_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_closing_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_closing_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_closing_image_image_id";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "faq_closing_image_alt";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gift_vouchers_hero_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gift_vouchers_hero_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gift_vouchers_hero_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_hero_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_hero_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_hero_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_closing_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_closing_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_closing_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_closing_image_image_id";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "gifts_closing_image_alt";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "contact_hero_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "contact_hero_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "contact_hero_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "blog_hero_heading_text";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "blog_hero_heading_italic";
    ALTER TABLE "site_content" DROP COLUMN IF EXISTS "blog_hero_text";
  `)
}
