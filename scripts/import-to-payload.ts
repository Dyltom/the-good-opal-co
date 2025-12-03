/**
 * Import all products and images into Payload CMS
 * Run with: npx tsx scripts/import-to-payload.ts
 */

import { config as dotenvConfig } from 'dotenv'
dotenvConfig() // Load .env file

import { getPayload } from 'payload'
import config from '@/payload.config'
import * as fs from 'fs'
import * as path from 'path'

const PRODUCTS_JSON = '/Users/dylanhenderson/the-good-opal-co/wordpress-products.json'
const IMAGES_DIR = '/Users/dylanhenderson/the-good-opal-co/public/images/products'

async function importToPayload() {
  console.log('🚀 Starting Payload import...\n')

  const payload = await getPayload({ config })

  // Read WordPress products
  const productsData = JSON.parse(fs.readFileSync(PRODUCTS_JSON, 'utf-8'))
  console.log(`📦 Found ${productsData.length} products to import\n`)

  let uploadedImages = 0
  let createdProducts = 0

  for (const product of productsData) {
    try {
      console.log(`\n📸 Processing: ${product.title}`)

      // 1. Upload image to Media collection
      let mediaId = null
      if (product.image_filename) {
        const imagePath = path.join(IMAGES_DIR, product.image_filename)

        if (fs.existsSync(imagePath)) {
          console.log(`  → Uploading image: ${product.image_filename}`)

          const imageBuffer = fs.readFileSync(imagePath)
          const media = await payload.create({
            collection: 'media',
            data: {
              alt: product.title,
            },
            file: {
              data: imageBuffer,
              mimetype: `image/${product.image_filename.split('.').pop()}`,
              name: product.image_filename,
              size: imageBuffer.length,
            },
          })

          mediaId = media.id
          uploadedImages++
          console.log(`  ✓ Image uploaded (ID: ${mediaId})`)
        } else {
          console.log(`  ⚠️  Image not found: ${product.image_filename}`)
        }
      }

      // 2. Create product in Products collection
      console.log(`  → Creating product...`)

      const productData: any = {
        name: product.title,
        slug: product.slug,
        description: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ text: product.description, type: 'text' }],
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        price: product.price,
        stock: product.stock || 0,
        status: product.stock > 0 ? 'published' : 'archived',
        featured: product.featured || false,
        category: product.category,
        weight: product.weight || undefined,
        tenantId: 'goodopalco',
      }

      // Add stoneType if exists
      if (product.stone_type) {
        const stoneTypeMap: any = {
          'Black Opal': 'black-opal',
          'White Opal': 'white-opal',
          'Boulder Opal': 'boulder-opal',
          'Crystal Opal': 'crystal-opal',
          'Doublet': 'black-opal',
          'Fire Opal': 'fire-opal',
        }
        productData.stoneType = stoneTypeMap[product.stone_type] || 'white-opal'
      }

      // Add stoneOrigin if exists
      if (product.origin) {
        const originMap: any = {
          'Lightning Ridge, NSW': 'lightning-ridge',
          'Coober Pedy, SA': 'coober-pedy',
          'Mintabie, SA': 'mintabie',
          'Andamooka, SA': 'andamooka',
          'Queensland': 'queensland',
        }
        productData.stoneOrigin = originMap[product.origin] || 'other-australian'
      }

      // Add images if exists
      if (mediaId) {
        productData.images = [{ image: mediaId }]
      }

      await payload.create({
        collection: 'products',
        data: productData,
      })

      createdProducts++
      console.log(`  ✓ Product created`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(`  ✗ Error: ${message}`)
    }
  }

  console.log(`\n\n✅ Import Complete!`)
  console.log(`📸 Uploaded ${uploadedImages} images`)
  console.log(`📦 Created ${createdProducts} products`)

  process.exit(0)
}

importToPayload().catch((error) => {
  console.error('💥 Import failed:', error)
  process.exit(1)
})
