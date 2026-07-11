import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "posts"
    SET "_status" = 'published'
    WHERE "status" = 'published'
      AND "legacy_word_press_id" IN (
        5423, 5327, 4905, 4886, 4880, 4873, 4854, 4849, 4845,
        4818, 4809, 4806, 4765, 4753, 4681, 3593, 3465, 3341
      );

    UPDATE "_posts_v"
    SET "version__status" = 'published'
    WHERE "version_status" = 'published'
      AND "version_legacy_word_press_id" IN (
        5423, 5327, 4905, 4886, 4880, 4873, 4854, 4849, 4845,
        4818, 4809, 4806, 4765, 4753, 4681, 3593, 3465, 3341
      );

    ALTER TABLE "posts" DROP COLUMN IF EXISTS "status";
    ALTER TABLE "_posts_v" DROP COLUMN IF EXISTS "version_status";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "posts"
      ADD COLUMN "status" "enum_posts_status" DEFAULT 'draft';
    UPDATE "posts" SET "status" = COALESCE("_status", 'draft');

    ALTER TABLE "_posts_v"
      ADD COLUMN "version_status" "enum__posts_v_version_status" DEFAULT 'draft';
    UPDATE "_posts_v" SET "version_status" = COALESCE("version__status", 'draft');
  `)
}
