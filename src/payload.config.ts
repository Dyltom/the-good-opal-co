import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

// Import collections
import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Posts } from './payload/collections/Posts'
import { Categories } from './payload/collections/Categories'
import { Products } from './payload/collections/Products'
import { Orders } from './payload/collections/Orders'
import { Customers } from './payload/collections/Customers'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

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
    Products,
    Orders,
    Customers,
  ],
  editor: lexicalEditor({}),
  secret: process.env['PAYLOAD_SECRET'] || 'your-secret-key-here',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'goodopalco',
      user: process.env.POSTGRES_USER || 'goodopalco',
      password: process.env.POSTGRES_PASSWORD || 'goodopalcopass',
    },
    // Auto-run migrations without prompts
    migrationDir: path.resolve(dirname, 'migrations'),
    push: true, // Auto-create tables on init
  }),
  sharp,
  plugins: [
    // SEO plugin - adds meta fields to collections
    seoPlugin({
      collections: ['posts', 'products'],
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
    // NOTE: Ecommerce plugin removed - using custom Products collection with opal-specific fields
    // We have custom cart/checkout with Stripe already working
  ],
})
