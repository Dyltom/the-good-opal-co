/**
 * Initialize Payload database tables
 */

import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import { getPayload } from 'payload'
import config from '@/payload.config'

async function initDb() {
  console.log('🔧 Initializing Payload database...\n')

  try {
    await getPayload({ config })
    console.log('✅ Payload initialized successfully!')
    console.log('📦 Database tables created')
    process.exit(0)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('💥 Error:', message)
    process.exit(1)
  }
}

initDb()
