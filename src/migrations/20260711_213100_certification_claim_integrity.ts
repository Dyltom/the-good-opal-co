import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "products"
    SET "certified" = false
    WHERE "certified" = true
      AND NULLIF(BTRIM("certificate_number"), '') IS NULL;
  `)
}

export async function down({ db: _db }: MigrateDownArgs): Promise<void> {
  // Data-integrity repair is intentionally irreversible: a missing certificate
  // number cannot prove that the previous certification claim was valid.
}
