import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "customers" ADD COLUMN "confirmation_token_hash" varchar;
  ALTER TABLE "customers" ADD COLUMN "confirmation_expires_at" timestamp(3) with time zone;
  ALTER TABLE "customers" ADD COLUMN "unsubscribe_token_hash" varchar;
  CREATE UNIQUE INDEX "customers_confirmation_token_hash_idx" ON "customers" USING btree ("confirmation_token_hash");
  CREATE UNIQUE INDEX "customers_unsubscribe_token_hash_idx" ON "customers" USING btree ("unsubscribe_token_hash");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "customers_confirmation_token_hash_idx";
  DROP INDEX "customers_unsubscribe_token_hash_idx";
  ALTER TABLE "customers" DROP COLUMN "confirmation_token_hash";
  ALTER TABLE "customers" DROP COLUMN "confirmation_expires_at";
  ALTER TABLE "customers" DROP COLUMN "unsubscribe_token_hash";`)
}
