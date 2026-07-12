import postgres from 'postgres'

const ALREADY_PRESENT_MIGRATIONS = [
  '20260710_234136_production_baseline',
  '20260711_003007_newsletter_security',
  '20260711_003719_order_delivery_security',
  '20260711_005753_inventory_alert_delivery',
  '20260711_005845_newsletter_delivery_state',
]

const REQUIRED_COLUMNS = [
  ['customers', 'confirmation_token_hash'],
  ['customers', 'newsletter_welcome_sent_at'],
  ['customers', 'newsletter_email_error'],
  ['orders', 'confirmation_email_sent_at'],
  ['orders', 'inventory_alert_sent_at'],
]

const NOT_YET_MIGRATED_COLUMNS = [
  ['customers', 'legacy_woo_id'],
  ['orders', 'legacy_woo_id'],
  ['products', 'legacy_woo_id'],
]

function columnKey(tableName, columnName) {
  return `${tableName}.${columnName}`
}

async function reconcileProductionMigrationLedger() {
  if (process.env.VERCEL_ENV !== 'production') return

  const checkOnly = process.argv.includes('--check')
  const databaseUrl = process.env.DATABASE_URL?.trim()
  if (!databaseUrl) throw new Error('[migration-ledger] DATABASE_URL is required in production.')

  const sql = postgres(databaseUrl, { max: 1 })
  try {
    await sql.begin(async (transaction) => {
      const ledger = await transaction`
        SELECT "id", "name", "batch"
        FROM "payload_migrations"
        ORDER BY "id"
        FOR UPDATE
      `

      const isLegacyDevLedger =
        ledger.length === 1 && ledger[0]?.name === 'dev' && Number(ledger[0]?.batch) === -1
      if (!isLegacyDevLedger) {
        console.log('[migration-ledger] Durable migration history already initialized.')
        return
      }

      const columns = await transaction`
        SELECT "table_name", "column_name"
        FROM "information_schema"."columns"
        WHERE "table_schema" = 'public'
      `
      const present = new Set(
        columns.map(({ table_name: tableName, column_name: columnName }) =>
          columnKey(tableName, columnName)
        )
      )

      const missingRequired = REQUIRED_COLUMNS.filter(
        ([tableName, columnName]) => !present.has(columnKey(tableName, columnName))
      )
      const unexpectedlyMigrated = NOT_YET_MIGRATED_COLUMNS.filter(([tableName, columnName]) =>
        present.has(columnKey(tableName, columnName))
      )

      if (missingRequired.length > 0 || unexpectedlyMigrated.length > 0) {
        throw new Error(
          '[migration-ledger] Refusing to repair an unrecognized dev schema. ' +
            `Missing expected columns: ${missingRequired.map((parts) => parts.join('.')).join(', ') || 'none'}. ` +
            `Unexpected later columns: ${unexpectedlyMigrated.map((parts) => parts.join('.')).join(', ') || 'none'}.`
        )
      }

      if (checkOnly) {
        console.log('[migration-ledger] Legacy production schema fingerprint verified.')
        return
      }

      const deleted = await transaction`
        DELETE FROM "payload_migrations"
        WHERE "id" = ${ledger[0].id} AND "name" = 'dev' AND "batch" = -1
        RETURNING "id"
      `
      if (deleted.length !== 1) {
        throw new Error('[migration-ledger] Dev marker changed while repair lock was held.')
      }

      for (const name of ALREADY_PRESENT_MIGRATIONS) {
        await transaction`
          INSERT INTO "payload_migrations" ("name", "batch")
          VALUES (${name}, 1)
        `
      }

      console.log(
        `[migration-ledger] Replaced legacy dev marker with ${ALREADY_PRESENT_MIGRATIONS.length} verified migration records.`
      )
    })
  } finally {
    await sql.end()
  }
}

await reconcileProductionMigrationLedger()
