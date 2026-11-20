import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { buildConfig, type CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { assertValidCoreProductionConfiguration } from './lib/deployment-readiness.ts'

// Import collections
import { Users } from './payload/collections/Users.ts'
import { Media } from './payload/collections/Media.ts'
import { Posts } from './payload/collections/Posts.ts'
import { Categories } from './payload/collections/Categories.ts'
import { Authors } from './payload/collections/Authors.ts'
import { Tags } from './payload/collections/Tags.ts'
import { Products } from './payload/collections/Products.ts'
import { Orders } from './payload/collections/Orders.ts'
import { Customers } from './payload/collections/Customers.ts'
import { Enquiries } from './payload/collections/Enquiries.ts'
import { Courses } from './payload/collections/Courses.ts'
import { CommerceImportRuns } from './payload/collections/CommerceImportRuns.ts'
import { InventoryReservations } from './payload/collections/InventoryReservations.ts'
import { CustomQuotes } from './payload/collections/CustomQuotes.ts'
import { CustomQuoteEvents } from './payload/collections/CustomQuoteEvents.ts'
import { RingDesigns } from './payload/collections/RingDesigns.ts'
import { RingReferenceChecks } from './payload/collections/RingReferenceChecks.ts'
import { RingAssets } from './payload/collections/RingAssets.ts'
import { InsightEvents } from './payload/collections/InsightEvents.ts'
import { Reviews } from './payload/collections/Reviews.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

assertValidCoreProductionConfiguration()

function getPayloadSecret(): string {
  const secret = process.env['PAYLOAD_SECRET']
  if (secret && secret.trim().length > 0) {
    return secret
  }

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('PAYLOAD_SECRET environment variable is required in production')
  }

  return 'development-only-payload-secret'
}

function getDatabaseUrl(): string {
  const databaseUrl = process.env['DATABASE_URL']
  if (databaseUrl && databaseUrl.trim().length > 0) {
    const parsed = new URL(databaseUrl)
    const sslMode = parsed.searchParams.get('sslmode')
    if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'verify-ca') {
      parsed.searchParams.set('sslmode', 'verify-full')
    }
    return parsed.toString()
  }

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error('DATABASE_URL environment variable is required in production')
  }

  return 'postgresql://goodopalco:goodopalcopass@localhost:5432/goodopalco'
}

function getRequiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim()
  if (value) return value

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error(`${name} environment variable is required in production`)
  }

  return ''
}

function getEmailSender(): { address: string; name: string } {
  const configured = getRequiredEnvironmentValue('EMAIL_FROM')
  const match = configured.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)

  if (match?.[1] && match[2]) {
    return { name: match[1], address: match[2] }
  }

  return {
    name: 'The Good Opal Co',
    address: configured || 'dev@localhost.invalid',
  }
}

const useLocalStorage = process.env['STORAGE_ADAPTER']?.trim() === 'local'
const uploadDir = path.resolve(process.env['UPLOAD_DIR']?.trim() || path.resolve(dirname, '..'))
const blobToken = useLocalStorage ? '' : getRequiredEnvironmentValue('BLOB_READ_WRITE_TOKEN')
const emailSender = getEmailSender()

for (const name of ['CONTACT_EMAIL', 'ADMIN_EMAIL']) {
  getRequiredEnvironmentValue(name)
}

function withUploadDir(collection: CollectionConfig): CollectionConfig {
  if (!useLocalStorage || typeof collection.upload !== 'object') return collection
  return {
    ...collection,
    upload: {
      ...collection.upload,
      staticDir: path.join(uploadDir, collection.upload.staticDir ?? collection.slug),
    },
  }
}

export default buildConfig({
  serverURL: getRequiredEnvironmentValue('NEXT_PUBLIC_APP_URL') || 'http://localhost:8412',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ['@/components/payload/insights/InsightsNavLink#InsightsNavLink'],
      beforeNavLinks: [],
      views: {
        insights: {
          Component: '@/components/payload/insights/InsightsView#InsightsView',
          path: '/insights',
        },
      },
    },
  },
  collections: [
    Users,
    withUploadDir(Media),
    Authors,
    Categories,
    Tags,
    Posts,
    Products,
    Orders,
    Customers,
    Enquiries,
    Courses,
    CommerceImportRuns,
    InventoryReservations,
    CustomQuotes,
    CustomQuoteEvents,
    withUploadDir(RingAssets),
    RingDesigns,
    RingReferenceChecks,
    InsightEvents,
    Reviews,
  ],
  editor: lexicalEditor({}),
  email: resendAdapter({
    defaultFromAddress: emailSender.address,
    defaultFromName: emailSender.name,
    apiKey: getRequiredEnvironmentValue('RESEND_API_KEY'),
  }),
  secret: getPayloadSecret(),
  typescript: {
    outputFile: path.resolve(dirname, 'types', 'payload-types.ts'),
  },
  db: postgresAdapter({
    transactionOptions: {
      isolationLevel: 'serializable',
    },
    pool: {
      connectionString: getDatabaseUrl(),
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    push: process.env['NODE_ENV'] !== 'production' && process.env['PAYLOAD_DB_PUSH'] !== 'false',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      addRandomSuffix: true,
      collections: {
        media: true,
      },
      token: blobToken,
      clientUploads: true,
    }),
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      addRandomSuffix: true,
      collections: {
        'ring-assets': {
          // Ring metadata remains admin-only while the immutable model URL stays
          // fetchable by the public Three.js renderer.
          disablePayloadAccessControl: true,
          prefix: 'rings',
        },
      },
      token: blobToken,
      // Validation must see exact bytes. Keep these small, immutable uploads on
      // the server path instead of direct-to-Blob client uploads.
      clientUploads: false,
    }),
    // SEO plugin - adds meta fields to collections
    seoPlugin({
      collections: ['posts', 'products', 'courses'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title || doc?.name || 'Page'} | The Good Opal Co`,
      generateDescription: ({ doc }) =>
        doc?.summary || doc?.description || doc?.excerpt || 'Australian opals and jewellery',
    }),
    // NOTE: Ecommerce plugin removed - using custom Products collection with opal-specific fields
    // We have custom cart/checkout with Stripe already working
  ],
})
