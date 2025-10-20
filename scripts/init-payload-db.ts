/**
 * Initialize Payload database tables
 */

import { config as dotenvConfig } from 'dotenv'
dotenvConfig()

import { getPayload } from 'payload'
import config from '@/payload.config'

async function initDb() {
  console.log('🔧 Initializing Payload database...\n')
  console.log(`📍 DATABASE_URL: ${process.env.DATABASE_URL}\n`)

  try {
    const payload = await getPayload({ config })
    console.log('✅ Payload initialized successfully!')
    console.log('📦 Database tables created')
    process.exit(0)
  } catch (error) {
    console.error('💥 Error:', error.message)
    process.exit(1)
  }
}

initDb()
