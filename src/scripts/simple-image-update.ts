import { getPayload } from '../lib/payload'

/**
 * Simple script to update products with image URLs directly
 */
async function simpleImageUpdate() {
  try {
    console.log('🖼️  Updating product images with URLs...\n')

    const payload = await getPayload()

    // Get all products
    const { docs: products } = await payload.find({
      collection: 'products',
      limit: 200,
      depth: 1
    })

    console.log(`Found ${products.length} products to update\n`)

    // Simple image mapping - each product gets a beautiful opal image
    const opalImages = [
      { url: '/api/media/file/20211104_234957-3.jpg', alt: 'Black Opal' },
      { url: '/api/media/file/20211104_234659-1-4.jpg', alt: 'Black Crystal Opal' },
      { url: '/api/media/file/20211104_233426-3.jpg', alt: 'Dark Opal' },
      { url: '/api/media/file/20211104_232150-3.jpg', alt: 'Lightning Ridge Opal' },
      { url: '/api/media/file/20211104_231937-3.jpg', alt: 'Premium Black Opal' },
      { url: '/api/media/file/IMG_0774-3.jpg', alt: 'Crystal Opal' },
      { url: '/api/media/file/IMG_0810-3.jpg', alt: 'Clear Crystal Opal' },
      { url: '/api/media/file/IMG_0803-3.jpg', alt: 'Brilliant Opal' },
      { url: '/api/media/file/20220109_132526-4.jpg', alt: 'Blue Opal' },
      { url: '/api/media/file/20220109_133155-3.jpg', alt: 'Fire Opal' },
      { url: '/api/media/file/IMG_5903-3.jpg', alt: 'White Opal' },
      { url: '/api/media/file/IMG_5904-3.jpg', alt: 'Milky Opal' },
      { url: '/api/media/file/20210627_202327-3.jpg', alt: 'Coober Pedy Opal' },
      { url: '/api/media/file/20210627_202949-3.jpg', alt: 'Light Opal' },
      { url: '/api/media/file/20210217_121854-scaled-e1614302386358-3.jpg', alt: 'Boulder Opal' },
      { url: '/api/media/file/20210819_102625-4.jpg', alt: 'Opal Ring' },
      { url: '/api/media/file/20210819_102749-7.jpg', alt: 'Gold Opal Ring' },
      { url: '/api/media/file/20211129_165305-4.jpg', alt: 'Premium Opal' },
      { url: '/api/media/file/heartthing-4.jpg', alt: 'Heart Opal' },
      { url: '/api/media/file/20210714_172106-e1626258929243-3.jpg', alt: 'Teardrop Opal' },
      { url: '/api/media/file/20211012_173801-3.jpg', alt: 'Matrix Opal' },
      { url: '/api/media/file/opal-1.jpg', alt: 'Rainbow Opal' },
      { url: '/api/media/file/opal-2.jpg', alt: 'Green Flash Opal' },
      { url: '/api/media/file/opal-3.jpg', alt: 'Red Fire Opal' },
      { url: '/api/media/file/opal-4.jpg', alt: 'Blue Green Opal' },
      { url: '/api/media/file/opal-5.jpg', alt: 'Harlequin Opal' },
      { url: '/api/media/file/opal-6.jpg', alt: 'Pinfire Opal' },
      { url: '/api/media/file/opal-7.jpg', alt: 'Broadflash Opal' }
    ]

    let updatedCount = 0
    let imageIndex = 0

    for (const product of products) {
      // Skip if product already has images
      if (product.images && product.images.length > 0) {
        console.log(`⏭️  Skipping ${product.name} - already has images`)
        continue
      }

      // Assign 1-3 images per product
      const numImages = Math.floor(Math.random() * 2) + 1 // 1-2 images
      const productImages = []

      for (let i = 0; i < numImages; i++) {
        // Create a mock media entry
        const image = opalImages[imageIndex % opalImages.length]

        // Create media entry
        const media = await payload.create({
          collection: 'media',
          data: {
            filename: image.url.split('/').pop()!,
            alt: `${product.name} - ${image.alt}`,
            url: image.url,
            mimeType: 'image/jpeg',
            filesize: 100000,
            width: 800,
            height: 800
          }
        })

        productImages.push({ image: media.id })
        imageIndex++
      }

      try {
        await payload.update({
          collection: 'products',
          id: product.id,
          data: {
            images: productImages
          }
        })

        console.log(`✅ Updated ${product.name} with ${productImages.length} images`)
        updatedCount++
      } catch (error) {
        console.error(`❌ Failed to update ${product.name}:`, error)
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products with images!`)

  } catch (error) {
    console.error('❌ Error updating product images:', error)
  } finally {
    process.exit(0)
  }
}

simpleImageUpdate()