import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const legacyPostIds = sql.raw(
  '5423,5327,4905,4886,4880,4873,4854,4849,4845,4818,4809,4806,4765,4753,4681,3593,3465,3341'
)

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "authors" (
      "id" serial PRIMARY KEY NOT NULL,
      "legacy_word_press_id" numeric,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "bio" varchar,
      "avatar_id" integer,
      "tenant_id" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE "tags" (
      "id" serial PRIMARY KEY NOT NULL,
      "legacy_word_press_id" numeric,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "description" varchar,
      "tenant_id" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "posts_rels" ADD COLUMN "tags_id" integer;
    ALTER TABLE "_posts_v_rels" ADD COLUMN "tags_id" integer;
    ALTER TABLE "categories" ADD COLUMN "legacy_word_press_id" numeric;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "authors_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "tags_id" integer;

    ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk"
      FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null;
    CREATE UNIQUE INDEX "authors_legacy_word_press_id_idx" ON "authors" ("legacy_word_press_id");
    CREATE UNIQUE INDEX "authors_slug_idx" ON "authors" ("slug");
    CREATE INDEX "authors_avatar_idx" ON "authors" ("avatar_id");
    CREATE INDEX "authors_tenant_id_idx" ON "authors" ("tenant_id");
    CREATE INDEX "authors_updated_at_idx" ON "authors" ("updated_at");
    CREATE INDEX "authors_created_at_idx" ON "authors" ("created_at");
    CREATE UNIQUE INDEX "tags_legacy_word_press_id_idx" ON "tags" ("legacy_word_press_id");
    CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" ("slug");
    CREATE INDEX "tags_tenant_id_idx" ON "tags" ("tenant_id");
    CREATE INDEX "tags_updated_at_idx" ON "tags" ("updated_at");
    CREATE INDEX "tags_created_at_idx" ON "tags" ("created_at");
    CREATE UNIQUE INDEX "categories_legacy_word_press_id_idx" ON "categories" ("legacy_word_press_id");

    INSERT INTO "authors" ("id", "name", "slug", "tenant_id")
    SELECT DISTINCT
      "users"."id",
      COALESCE(NULLIF("users"."name", ''), 'CMS author'),
      'cms-user-' || "users"."id",
      COALESCE(NULLIF("users"."tenant_id", ''), 'good-opal-co')
    FROM "users"
    WHERE EXISTS (SELECT 1 FROM "posts" WHERE "posts"."author_id" = "users"."id")
       OR EXISTS (SELECT 1 FROM "_posts_v" WHERE "_posts_v"."version_author_id" = "users"."id")
    ON CONFLICT ("id") DO NOTHING;

    SELECT setval(
      pg_get_serial_sequence('authors', 'id'),
      GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "authors"), 1),
      true
    );

    INSERT INTO "authors" (
      "legacy_word_press_id", "name", "slug", "bio", "tenant_id"
    ) VALUES (
      2,
      'Stephanie Caruana',
      'steph',
      'Founder of The Good Opal Co, sharing practical guidance about Australian opal, cutting, and jewellery.',
      'good-opal-co'
    )
    ON CONFLICT ("legacy_word_press_id") DO UPDATE SET
      "name" = EXCLUDED."name",
      "slug" = EXCLUDED."slug",
      "bio" = EXCLUDED."bio",
      "tenant_id" = EXCLUDED."tenant_id",
      "updated_at" = now();

    SELECT setval(
      pg_get_serial_sequence('authors', 'id'),
      GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "authors"), 1),
      true
    );

    ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_users_id_fk";
    ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_author_id_users_id_fk";
    ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_authors_id_fk"
      FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null;
    ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_authors_id_fk"
      FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null;

    ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_tags_fk"
      FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade;
    ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_tags_fk"
      FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk"
      FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk"
      FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade;
    CREATE INDEX "posts_rels_tags_id_idx" ON "posts_rels" ("tags_id");
    CREATE INDEX "_posts_v_rels_tags_id_idx" ON "_posts_v_rels" ("tags_id");
    CREATE INDEX "payload_locked_documents_rels_authors_id_idx"
      ON "payload_locked_documents_rels" ("authors_id");
    CREATE INDEX "payload_locked_documents_rels_tags_id_idx"
      ON "payload_locked_documents_rels" ("tags_id");

    INSERT INTO "categories" (
      "legacy_word_press_id", "name", "slug", "description", "tenant_id"
    ) VALUES
      (1, 'DIY Cabbing Machine', 'diycabbing-machine', 'Learn how to build your own Cabbing Machine on a budget!', 'good-opal-co'),
      (46, 'Opal Cutting', 'opal-cutting', NULL, 'good-opal-co'),
      (51, 'Jewellery', 'jewellery', NULL, 'good-opal-co')
    ON CONFLICT ("slug") DO UPDATE SET
      "legacy_word_press_id" = EXCLUDED."legacy_word_press_id",
      "name" = EXCLUDED."name",
      "description" = EXCLUDED."description",
      "tenant_id" = EXCLUDED."tenant_id",
      "updated_at" = now();

    INSERT INTO "tags" ("legacy_word_press_id", "name", "slug", "tenant_id") VALUES
      (52, 'DIY Opal Cutting Machine', 'diy-opal-cutting-machine', 'good-opal-co'),
      (55, 'Ring sizing', 'are-you-having-trouble-figuring-out-your-ring-size-read-this-blog-for-a-quick-and-easy-ring-size-hack', 'good-opal-co'),
      (56, 'Opal cutting for beginners!', 'opal-cutting-for-beginners', 'good-opal-co'),
      (89, 'Dreamtime stories', 'dreamtime-stories', 'good-opal-co'),
      (90, 'Opal', 'opal', 'good-opal-co'),
      (91, 'Indigenous Australian use of opal', 'indigenous-australian-use-of-opal', 'good-opal-co'),
      (92, 'Opal facts', 'opal-facts', 'good-opal-co'),
      (93, 'How to value opal', 'how-to-value-opal', 'good-opal-co'),
      (94, 'How opal is mined', 'how-opal-is-mined', 'good-opal-co'),
      (95, 'Learn how to cut opal', 'learn-how-to-cut-opal', 'good-opal-co'),
      (96, 'Buying opal', 'buying-opal', 'good-opal-co'),
      (97, 'Opal jewellery', 'opal-jewellery', 'good-opal-co'),
      (98, 'Mintabie opal', 'mintabie-opal', 'good-opal-co'),
      (100, 'Coober Pedy opal', 'coober-pedy-opal', 'good-opal-co'),
      (101, 'White opal', 'white-opal', 'good-opal-co'),
      (102, 'Crystal opal', 'crystal-opal', 'good-opal-co'),
      (103, 'Boulder opal', 'boulder-opal', 'good-opal-co'),
      (104, 'Cutting opal', 'cutting-opal', 'good-opal-co'),
      (105, 'Lightning Ridge', 'lightning-ridge', 'good-opal-co'),
      (106, 'Sightseeing', 'site-seeing', 'good-opal-co'),
      (107, 'Visiting Lightning Ridge', 'visiting-lightning-ridge', 'good-opal-co')
    ON CONFLICT ("legacy_word_press_id") DO UPDATE SET
      "name" = EXCLUDED."name",
      "slug" = EXCLUDED."slug",
      "tenant_id" = EXCLUDED."tenant_id",
      "updated_at" = now();

    UPDATE "posts"
    SET "author_id" = (
      SELECT "id" FROM "authors" WHERE "legacy_word_press_id" = 2
    )
    WHERE "legacy_word_press_id" IN (${legacyPostIds});

    DELETE FROM "posts_rels"
    WHERE "path" IN ('categories', 'tags')
      AND "parent_id" IN (
        SELECT "id" FROM "posts" WHERE "legacy_word_press_id" IN (${legacyPostIds})
      );

    INSERT INTO "posts_rels" ("order", "parent_id", "path", "categories_id")
    SELECT 1, "posts"."id", 'categories', "categories"."id"
    FROM (VALUES
      (5423,1),(5327,51),(4905,46),(4886,46),(4880,46),(4873,46),
      (4854,46),(4849,51),(4845,1),(4818,46),(4809,46),(4806,46),
      (4765,46),(4753,46),(4681,1),(3593,51),(3465,46),(3341,1)
    ) AS mapping("post_id", "category_id")
    JOIN "posts" ON "posts"."legacy_word_press_id" = mapping."post_id"
    JOIN "categories" ON "categories"."legacy_word_press_id" = mapping."category_id";

    INSERT INTO "posts_rels" ("order", "parent_id", "path", "tags_id")
    SELECT mapping."sort_order", "posts"."id", 'tags', "tags"."id"
    FROM (VALUES
      (4905,105,1),(4905,106,2),(4905,107,3),(4886,103,1),(4886,104,2),
      (4873,100,1),(4873,102,2),(4873,101,3),(4854,98,1),(4849,96,1),
      (4849,97,2),(4845,95,1),(4818,94,1),(4765,93,1),(4753,92,1),
      (4681,89,1),(4681,91,2),(4681,90,3),(3593,55,1),(3465,56,1),(3341,52,1)
    ) AS mapping("post_id", "tag_id", "sort_order")
    JOIN "posts" ON "posts"."legacy_word_press_id" = mapping."post_id"
    JOIN "tags" ON "tags"."legacy_word_press_id" = mapping."tag_id";

    DROP TABLE "posts_tags" CASCADE;
    DROP TABLE "_posts_v_version_tags" CASCADE;
    ALTER TABLE "categories" DROP COLUMN "post_count";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "posts_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "tag" varchar
    );
    CREATE TABLE "_posts_v_version_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "tag" varchar,
      "_uuid" varchar
    );

    INSERT INTO "posts_tags" ("_order", "_parent_id", "id", "tag")
    SELECT
      COALESCE("posts_rels"."order", 0),
      "posts_rels"."parent_id",
      'rollback-' || "posts_rels"."id",
      "tags"."name"
    FROM "posts_rels"
    JOIN "tags" ON "tags"."id" = "posts_rels"."tags_id"
    WHERE "posts_rels"."path" = 'tags';

    ALTER TABLE "posts" DROP CONSTRAINT "posts_author_id_authors_id_fk";
    ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_author_id_authors_id_fk";
    ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_tags_fk";
    ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_tags_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_authors_fk";
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_tags_fk";

    UPDATE "posts" SET "author_id" = NULL
    WHERE "author_id" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "users" WHERE "users"."id" = "posts"."author_id");
    UPDATE "_posts_v" SET "version_author_id" = NULL
    WHERE "version_author_id" IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "users" WHERE "users"."id" = "_posts_v"."version_author_id"
      );

    ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_users_id_fk"
      FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null;
    ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_id_users_id_fk"
      FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null;

    DROP INDEX "categories_legacy_word_press_id_idx";
    DROP INDEX "posts_rels_tags_id_idx";
    DROP INDEX "_posts_v_rels_tags_id_idx";
    DROP INDEX "payload_locked_documents_rels_authors_id_idx";
    DROP INDEX "payload_locked_documents_rels_tags_id_idx";
    ALTER TABLE "categories" ADD COLUMN "post_count" numeric DEFAULT 0;
    ALTER TABLE "categories" DROP COLUMN "legacy_word_press_id";
    ALTER TABLE "posts_rels" DROP COLUMN "tags_id";
    ALTER TABLE "_posts_v_rels" DROP COLUMN "tags_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "authors_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "tags_id";

    ALTER TABLE "posts_tags" ADD CONSTRAINT "posts_tags_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade;
    ALTER TABLE "_posts_v_version_tags" ADD CONSTRAINT "_posts_v_version_tags_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade;
    CREATE INDEX "posts_tags_order_idx" ON "posts_tags" ("_order");
    CREATE INDEX "posts_tags_parent_id_idx" ON "posts_tags" ("_parent_id");
    CREATE INDEX "_posts_v_version_tags_order_idx" ON "_posts_v_version_tags" ("_order");
    CREATE INDEX "_posts_v_version_tags_parent_id_idx"
      ON "_posts_v_version_tags" ("_parent_id");

    DROP TABLE "authors" CASCADE;
    DROP TABLE "tags" CASCADE;
  `)
}
