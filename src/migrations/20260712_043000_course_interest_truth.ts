import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const courseSlug = 'complete-opal-cutting-valuation-course'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "courses"
    SET
      "introduction" = 'Steph created this public outline to make opal-cutting knowledge easier for beginners to explore. It moves from understanding rough opal through sandpaper, rotary-tool, and cabbing-machine methods, then finishes with opal valuation.\n\nThe course format, timing, availability, support, and price are still being confirmed. Sending an interest enquiry is not enrolment or payment.',
      "meta_description" = 'Explore Steph''s public outline for opal anatomy, cutting methods, polishing, and valuation, then send an interest enquiry for confirmed details.',
      "updated_at" = now()
    WHERE "slug" = ${courseSlug};
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "courses"
    SET
      "introduction" = 'Steph created this course to make opal cutting knowledge more accessible to beginners. The public outline moves from understanding rough opal through sandpaper, rotary-tool, and cabbing-machine methods, then finishes with opal valuation.\n\nThis page records the verified course outline. Access timing, payment, support, and lesson availability are confirmed directly before any enrolment is offered.',
      "meta_description" = 'Explore the verified outline for Steph''s online course covering opal anatomy, cutting methods, polishing, and valuation.',
      "updated_at" = now()
    WHERE "slug" = ${courseSlug};
  `)
}
