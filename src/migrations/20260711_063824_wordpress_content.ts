import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "legacy_word_press_id" numeric;
  ALTER TABLE "media" ADD COLUMN "legacy_source_url" varchar;
  ALTER TABLE "posts" ADD COLUMN "legacy_word_press_id" numeric;
  ALTER TABLE "_posts_v" ADD COLUMN "version_legacy_word_press_id" numeric;
  CREATE UNIQUE INDEX "media_legacy_word_press_id_idx" ON "media" USING btree ("legacy_word_press_id");
  CREATE UNIQUE INDEX "media_legacy_source_url_idx" ON "media" USING btree ("legacy_source_url");
  CREATE UNIQUE INDEX "posts_legacy_word_press_id_idx" ON "posts" USING btree ("legacy_word_press_id");
  CREATE INDEX "_posts_v_version_version_legacy_word_press_id_idx" ON "_posts_v" USING btree ("version_legacy_word_press_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_legacy_word_press_id_idx";
  DROP INDEX "media_legacy_source_url_idx";
  DROP INDEX "posts_legacy_word_press_id_idx";
  DROP INDEX "_posts_v_version_version_legacy_word_press_id_idx";
  ALTER TABLE "media" DROP COLUMN "legacy_word_press_id";
  ALTER TABLE "media" DROP COLUMN "legacy_source_url";
  ALTER TABLE "posts" DROP COLUMN "legacy_word_press_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_legacy_word_press_id";`)
}
