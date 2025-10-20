import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ecommercePlugin, USD, EUR, GBP } from '@payloadcms/plugin-ecommerce'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import type { Access, FieldAccess } from 'payload'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import collections directly (TypeScript resolves extensions)
import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Posts } from './payload/collections/Posts'
import { Categories } from './payload/collections/Categories'
// NOTE: Products collection is created by ecommercePlugin, not imported here

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Access control functions for ecommerce
const adminOnly: Access = ({ req: { user } }) => user?.['role'] === 'admin'
const adminOnlyFieldAccess: FieldAccess = ({ req: { user } }) => user?.['role'] === 'admin'
const adminOrCustomerOwner: Access = ({ req: { user } }) => {
  if (user?.['role'] === 'admin') return true
  return { 'customer.value': { equals: user?.id } }
}
const adminOrPublishedStatus: Access = ({ req: { user } }) => {
  if (user?.['role'] === 'admin') return true
  return { status: { equals: 'published' } }
}
const authenticatedOnly: Access = ({ req: { user } }) => !!user
const customerOnlyFieldAccess: FieldAccess = ({ req: { user } }) => user?.['role'] !== 'admin'
const publicAccess: Access = () => true

export default buildConfig({
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
  collections: [
    Users,
    Media,
    Posts,
    Categories,
    // Products collection created by ecommercePlugin
  ],
  editor: lexicalEditor({}),
  secret: process.env['PAYLOAD_SECRET'] || 'your-secret-key-here',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env['DATABASE_URL'],
    },
    // Auto-run migrations without prompts
    migrationDir: path.resolve(dirname, 'migrations'),
    push: true, // Auto-create tables on init
  }),
  sharp,
  plugins: [
    // SEO plugin - adds meta fields to collections
    seoPlugin({
      collections: ['pages', 'posts', 'products'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc?.title || doc?.name || 'Page'} | The Good Opal Co`,
      generateDescription: ({ doc }) =>
        doc?.description || doc?.excerpt || 'Premium Australian opal jewelry',
    }),
    // Search plugin - fast indexed search
    searchPlugin({
      collections: ['posts', 'products'],
      defaultPriorities: {
        posts: 10,
        products: 20,
      },
    }),
    // Ecommerce plugin
    ecommercePlugin({
      // Required access control
      access: {
        adminOnly,
        adminOnlyFieldAccess,
        adminOrCustomerOwner,
        adminOrPublishedStatus,
        authenticatedOnly,
        customerOnlyFieldAccess,
        publicAccess,
      },
      // Customer configuration (required)
      customers: {
        slug: 'users', // Use our existing Users collection
      },
      // Currency configuration
      currencies: {
        defaultCurrency: 'USD',
        supportedCurrencies: [USD, EUR, GBP],
      },
      // Products with variants
      products: {
        variants: true,
      },
      // Enable orders
      orders: true,
      // Enable shopping carts
      carts: true,
      // Enable transaction tracking
      transactions: true,
      // Addresses for shipping
      addresses: {
        supportedCountries: [
          { label: 'United States', value: 'US' },
          { label: 'Canada', value: 'CA' },
          { label: 'United Kingdom', value: 'GB' },
          { label: 'Australia', value: 'AU' },
          { label: 'New Zealand', value: 'NZ' },
          { label: 'Ireland', value: 'IE' },
        ],
      },
      // Inventory tracking
      inventory: {
        fieldName: 'stock', // Use our existing stock field
      },
      // Payment methods (Stripe)
      payments: {
        paymentMethods: [], // We'll configure Stripe adapter separately
      },
    }),
  ],
})
