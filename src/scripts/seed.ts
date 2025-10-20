/**
 * Seed Script
 *
 * Run with: pnpm seed
 *
 * Seeds demo data for testing and demonstration
 */

import { getPayload } from 'payload'
import config from '@payload-config'
import { seedAllDemoData } from '@/lib/seed'

async function run() {
  try {
    console.log('🚀 Initializing Payload...')
    const payload = await getPayload({ config })

    // Get or create default tenant
    const tenants = await payload.find({
      collection: 'tenants',
      limit: 1,
    })

    let tenantId: string

    if (tenants.docs.length > 0 && tenants.docs[0]) {
      tenantId = String(tenants.docs[0].id)
      console.log(`✅ Using existing tenant: ${tenants.docs[0]['name']}`)
    } else {
      console.log('📝 Creating default tenant...')
      const tenant = await payload.create({
        collection: 'tenants',
        data: {
          name: 'Demo Site',
          subdomain: 'demo',
          customDomain: '',
          status: 'active',
        },
      })
      tenantId = String(tenant.id)
      console.log(`✅ Created tenant: ${tenant['name']}`)
    }

    // Seed all demo data
    await seedAllDemoData(payload, tenantId)

    console.log('\n✨ All demo data seeded successfully!')
    console.log('🎯 Visit http://localhost:3000/admin to see your data')

    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

run()
