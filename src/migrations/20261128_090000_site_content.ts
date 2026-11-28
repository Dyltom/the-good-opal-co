import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_content" (
      "id" serial PRIMARY KEY NOT NULL,
      "home_collection_heading_text" varchar,
      "home_collection_heading_italic" varchar,
      "home_custom_image_image_id" integer,
      "home_custom_image_alt" varchar,
      "home_custom_heading_text" varchar,
      "home_custom_heading_italic" varchar,
      "home_custom_text" varchar,
      "home_reviews_heading" varchar,
      "home_closing_heading_text" varchar,
      "home_closing_heading_italic" varchar,
      "home_closing_text" varchar,
      "home_closing_image_image_id" integer,
      "home_closing_image_alt" varchar,
      "about_hero_heading_text" varchar,
      "about_hero_heading_italic" varchar,
      "about_hero_text" varchar,
      "about_hero_image1_image_id" integer,
      "about_hero_image1_alt" varchar,
      "about_hero_image2_image_id" integer,
      "about_hero_image2_alt" varchar,
      "about_hero_image3_image_id" integer,
      "about_hero_image3_alt" varchar,
      "about_closing_heading_text" varchar,
      "about_closing_heading_italic" varchar,
      "about_closing_text" varchar,
      "about_closing_image_image_id" integer,
      "about_closing_image_alt" varchar,
      "services_hero_heading_text" varchar,
      "services_hero_heading_italic" varchar,
      "services_hero_text" varchar,
      "services_hero_image_image_id" integer,
      "services_hero_image_alt" varchar,
      "services_process_heading_text" varchar,
      "services_process_heading_italic" varchar,
      "services_closing_heading_text" varchar,
      "services_closing_heading_italic" varchar,
      "services_closing_text" varchar,
      "services_closing_image_image_id" integer,
      "services_closing_image_alt" varchar,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
    CREATE TABLE IF NOT EXISTS "_site_content_v" (
      "id" serial PRIMARY KEY NOT NULL,
      "version_home_collection_heading_text" varchar,
      "version_home_collection_heading_italic" varchar,
      "version_home_custom_image_image_id" integer,
      "version_home_custom_image_alt" varchar,
      "version_home_custom_heading_text" varchar,
      "version_home_custom_heading_italic" varchar,
      "version_home_custom_text" varchar,
      "version_home_reviews_heading" varchar,
      "version_home_closing_heading_text" varchar,
      "version_home_closing_heading_italic" varchar,
      "version_home_closing_text" varchar,
      "version_home_closing_image_image_id" integer,
      "version_home_closing_image_alt" varchar,
      "version_about_hero_heading_text" varchar,
      "version_about_hero_heading_italic" varchar,
      "version_about_hero_text" varchar,
      "version_about_hero_image1_image_id" integer,
      "version_about_hero_image1_alt" varchar,
      "version_about_hero_image2_image_id" integer,
      "version_about_hero_image2_alt" varchar,
      "version_about_hero_image3_image_id" integer,
      "version_about_hero_image3_alt" varchar,
      "version_about_closing_heading_text" varchar,
      "version_about_closing_heading_italic" varchar,
      "version_about_closing_text" varchar,
      "version_about_closing_image_image_id" integer,
      "version_about_closing_image_alt" varchar,
      "version_services_hero_heading_text" varchar,
      "version_services_hero_heading_italic" varchar,
      "version_services_hero_text" varchar,
      "version_services_hero_image_image_id" integer,
      "version_services_hero_image_alt" varchar,
      "version_services_process_heading_text" varchar,
      "version_services_process_heading_italic" varchar,
      "version_services_closing_heading_text" varchar,
      "version_services_closing_heading_italic" varchar,
      "version_services_closing_text" varchar,
      "version_services_closing_image_image_id" integer,
      "version_services_closing_image_alt" varchar,
      "version_updated_at" timestamp(3) with time zone,
      "version_created_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_about_closing_image_image_id_media_id_f" FOREIGN KEY ("version_about_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_about_hero_image1_image_id_media_id_fk" FOREIGN KEY ("version_about_hero_image1_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_about_hero_image2_image_id_media_id_fk" FOREIGN KEY ("version_about_hero_image2_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_about_hero_image3_image_id_media_id_fk" FOREIGN KEY ("version_about_hero_image3_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_home_closing_image_image_id_media_id_fk" FOREIGN KEY ("version_home_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_home_custom_image_image_id_media_id_fk" FOREIGN KEY ("version_home_custom_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_services_closing_image_image_id_media_i" FOREIGN KEY ("version_services_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "_site_content_v" ADD CONSTRAINT "_site_content_v_version_services_hero_image_image_id_media_id_f" FOREIGN KEY ("version_services_hero_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_about_closing_image_image_id_media_id_fk" FOREIGN KEY ("about_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_about_hero_image1_image_id_media_id_fk" FOREIGN KEY ("about_hero_image1_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_about_hero_image2_image_id_media_id_fk" FOREIGN KEY ("about_hero_image2_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_about_hero_image3_image_id_media_id_fk" FOREIGN KEY ("about_hero_image3_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_home_closing_image_image_id_media_id_fk" FOREIGN KEY ("home_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_home_custom_image_image_id_media_id_fk" FOREIGN KEY ("home_custom_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_services_closing_image_image_id_media_id_fk" FOREIGN KEY ("services_closing_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "site_content" ADD CONSTRAINT "site_content_services_hero_image_image_id_media_id_fk" FOREIGN KEY ("services_hero_image_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "_site_content_v_created_at_idx" ON "_site_content_v" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "_site_content_v_updated_at_idx" ON "_site_content_v" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_about_closing_image_version_abou_idx" ON "_site_content_v" USING btree ("version_about_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_about_hero_image1_version_about__idx" ON "_site_content_v" USING btree ("version_about_hero_image1_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_about_hero_image2_version_about__idx" ON "_site_content_v" USING btree ("version_about_hero_image2_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_about_hero_image3_version_about__idx" ON "_site_content_v" USING btree ("version_about_hero_image3_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_home_closing_image_version_home__idx" ON "_site_content_v" USING btree ("version_home_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_home_custom_image_version_home_c_idx" ON "_site_content_v" USING btree ("version_home_custom_image_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_services_closing_image_version_s_idx" ON "_site_content_v" USING btree ("version_services_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "_site_content_v_version_services_hero_image_version_serv_idx" ON "_site_content_v" USING btree ("version_services_hero_image_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_about_closing_image_about_closing_image_ima_idx" ON "site_content" USING btree ("about_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_about_hero_image1_about_hero_image1_image_idx" ON "site_content" USING btree ("about_hero_image1_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_about_hero_image2_about_hero_image2_image_idx" ON "site_content" USING btree ("about_hero_image2_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_about_hero_image3_about_hero_image3_image_idx" ON "site_content" USING btree ("about_hero_image3_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_home_closing_image_home_closing_image_image_idx" ON "site_content" USING btree ("home_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_home_custom_image_home_custom_image_image_idx" ON "site_content" USING btree ("home_custom_image_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_services_closing_image_services_closing_ima_idx" ON "site_content" USING btree ("services_closing_image_image_id");
    CREATE INDEX IF NOT EXISTS "site_content_services_hero_image_services_hero_image_ima_idx" ON "site_content" USING btree ("services_hero_image_image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "_site_content_v" CASCADE;
    DROP TABLE IF EXISTS "site_content" CASCADE;
  `)
}
