import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" ADD COLUMN "newsletter_welcome_sent_at" timestamp(3) with time zone;
  ALTER TABLE "customers" ADD COLUMN "newsletter_email_error" varchar;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" DROP COLUMN "newsletter_welcome_sent_at";
  ALTER TABLE "customers" DROP COLUMN "newsletter_email_error";`)
}
