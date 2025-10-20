/**
 * Import all products and images into Payload CMS
 * Run with: npx tsx scripts/import-to-payload.ts
 */

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

      const productData = {
        name: product.title,
        slug: product.slug,
        description: [
          {
            type: 'paragraph',
            children: [{ text: product.description }],
          },
        ],
        price: product.price,
        stock: product.stock,
        status: product.stock > 0 ? 'published' : 'archived',
        featured: product.featured || false,
        category: product.category,
        stoneType: product.stone_type,
        stoneOrigin: product.origin,
        weight: product.weight,
        tenantId: 'good-opal-co',
        images: mediaId
          ? [
              {
                image: mediaId,
              },
            ]
          : [],
      }

      await payload.create({
        collection: 'products',
        data: productData,
      })

      createdProducts++
      console.log(`  ✓ Product created`)
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`)
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
