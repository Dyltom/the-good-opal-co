import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { resendAdapter } from '@payloadcms/email-resend'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { assertValidCoreProductionConfiguration } from './lib/deployment-readiness.ts'

// Import collections
import { Users } from './payload/collections/Users.ts'
import { Media } from './payload/collections/Media.ts'
import { Posts } from './payload/collections/Posts.ts'
import { Categories } from './payload/collections/Categories.ts'
import { Products } from './payload/collections/Products.ts'
import { Orders } from './payload/collections/Orders.ts'
import { Customers } from './payload/collections/Customers.ts'

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

function requireOneEnvironmentValue(names: string[], label: string): string {
  for (const name of names) {
    const value = process.env[name]?.trim()
    if (value) return value
  }

  if (process.env['NODE_ENV'] === 'production') {
    throw new Error(`${label} environment variable is required in production`)
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

const blobToken = getRequiredEnvironmentValue('BLOB_READ_WRITE_TOKEN')
const emailSender = getEmailSender()

for (const name of [
  'CONTACT_EMAIL',
  'ADMIN_EMAIL',
]) {
  getRequiredEnvironmentValue(name)
}

requireOneEnvironmentValue(
  ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_KV_REST_API_URL'],
  'Upstash Redis URL',
)
requireOneEnvironmentValue(
  ['UPSTASH_REDIS_REST_TOKEN', 'UPSTASH_REDIS_REST_KV_REST_API_TOKEN'],
  'Upstash Redis token',
)

export default buildConfig({
  serverURL: getRequiredEnvironmentValue('NEXT_PUBLIC_APP_URL') || 'http://localhost:8412',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: [],
      beforeNavLinks: [],
    },
  },
  collections: [Users, Media, Posts, Categories, Products, Orders, Customers],
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
    push: process.env['NODE_ENV'] !== 'production',
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      collections: {
        media: true,
      },
      token: blobToken,
      clientUploads: true,
    }),
    // SEO plugin - adds meta fields to collections
    seoPlugin({
      collections: ['posts', 'products'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title || doc?.name || 'Page'} | The Good Opal Co`,
      generateDescription: ({ doc }) =>
        doc?.description || doc?.excerpt || 'Premium Australian opal jewelry',
    }),
    // NOTE: Ecommerce plugin removed - using custom Products collection with opal-specific fields
    // We have custom cart/checkout with Stripe already working
  ],
})
