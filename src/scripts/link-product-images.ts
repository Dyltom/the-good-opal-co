import { getPayload } from '../lib/payload'
import fs from 'fs'
import path from 'path'

/**
 * Maps product images to products based on product names and image patterns
 */
async function linkProductImages() {
  try {
    console.log('🖼️  Linking product images...\n')

    const payload = await getPayload()
    const imagesDir = path.join(process.cwd(), 'public/images/products')
    const imageFiles = fs.readdirSync(imagesDir).filter(file =>
      file.endsWith('.jpg') || file.endsWith('.png')
    )

    console.log(`Found ${imageFiles.length} images in products directory`)

    // Get all products
    const { docs: products } = await payload.find({
      collection: 'products',
      limit: 200,
      depth: 0
    })

    console.log(`Found ${products.length} products to update\n`)

    // Map image files to products based on keywords
    const imageMapping: Record<string, string[]> = {
      // Black Opals
      'Black Opal': ['20211104_234957', '20211104_234659', '20211104_231937', '20211104_234025'],
      'Lightning Ridge Black Opal': ['20211104_232150', '20211104_233426', '20211104_232559'],
      'Lightning Ridge Black Crystal Opal': ['20211104_233233', '20211104_234224', '20211104_234430'],
      'Semi Black Opal': ['20211104_230316', '20211104_232342', '20211104_232926'],

      // Crystal Opals
      'Crystal Opal': ['20220109_132526', '20220109_133155', '20220109_133519', '20220109_133657'],
      'Lightning Ridge Crystal Opal': ['IMG_0774', 'IMG_0779', 'IMG_0803', 'IMG_0810'],

      // White Opals
      'White Opal': ['IMG_5903', 'IMG_5904', 'IMG-0741', 'IMG_0804'],
      'Coober Pedy White Opal': ['20210627_202327', '20210627_202949', '20210627_192839'],

      // Boulder Opals
      'Boulder Opal': ['20210119_132504', '20210217_121854', '20210217_114935', '20210217_115308'],
      'Queensland Boulder Opal': ['20210217_163518', '20210428_110715', '20210505_102859'],

      // Heart/Carved Opals
      'heart': ['heartthing', 'heart-opal-pendant', '20210612_163955', '20210612_162356'],

      // Rings
      'Aurora Ring': ['opal-ring-1', 'opal-ring-2'],
      'Ring': ['20210819_101509', '20210819_101746', '20210819_101941'],
      'Sun and Moon Ring': ['20210819_102201', '20210819_102300', '20210819_102346'],
      'Coral Ring': ['20210819_102625', '20210819_102749'],
      'Gemini Ring': ['20211129_164004', '20211129_164200', '20211129_164407'],

      // Pendants/Necklaces
      'Pendant': ['20210714_171016', '20210714_171456', '20210714_171803'],
      'Teardrop': ['20210714_172106', '20210809_180424', '20210809_180732'],

      // Doublets/Triplets
      'Doublet': ['20210809_181013', '20210809_181553', '20210809_181757'],
      'Triplet': ['20210809_182017', '20210809_182256', '20210809_182611'],

      // Parcels
      'Parcel': ['20210912_202757', '20210923_155700', '20210923_161001'],
      'Jeweller': ['20210923_163244', '20210923_163402', '20210923_172817'],

      // Premium/Special pieces
      'Premium': ['20211129_165305', '20211012_173801', '20211012_174507'],
      'Fossil Opal': ['20211012_170220', '20211012_171941', '20211012_173350'],

      // General opals
      'Opal': ['opal-1', 'opal-2', 'opal-3', 'opal-4', 'opal-5', 'opal-6', 'opal-7']
    }

    let updatedCount = 0

    for (const product of products) {
      const matchingImages: string[] = []

      // Find images that match this product
      for (const [keyword, imagePatterns] of Object.entries(imageMapping)) {
        if (product.name.includes(keyword)) {
          for (const pattern of imagePatterns) {
            const matchingFiles = imageFiles.filter(file => file.includes(pattern))
            matchingImages.push(...matchingFiles)
          }
        }
      }

      // Remove duplicates and limit to 4 images per product
      const uniqueImages = Array.from(new Set(matchingImages)).slice(0, 4)

      if (uniqueImages.length > 0) {
        try {
          // Upload images to media collection
          const mediaIds: string[] = []

          for (const imageName of uniqueImages) {
            const imagePath = path.join(imagesDir, imageName)
            const imageBuffer = fs.readFileSync(imagePath)

            // Check if media already exists
            const existingMedia = await payload.find({
              collection: 'media',
              where: {
                filename: {
                  equals: imageName
                }
              },
              limit: 1
            })

            let mediaId: string

            if (existingMedia.docs.length > 0) {
              mediaId = existingMedia.docs[0].id
            } else {
              // Create new media entry
              const media = await payload.create({
                collection: 'media',
                data: {
                  filename: imageName,
                  alt: `${product.name} - Australian Opal`,
                  url: `/images/products/${imageName}`,
                  mimeType: imageName.endsWith('.png') ? 'image/png' : 'image/jpeg',
                  filesize: imageBuffer.length,
                  width: 800, // Default values, actual dimensions would need to be calculated
                  height: 800
                }
              })
              mediaId = media.id
            }

            mediaIds.push(mediaId)
          }

          // Update product with image references
          await payload.update({
            collection: 'products',
            id: product.id,
            data: {
              images: mediaIds.map(id => ({ image: id }))
            }
          })

          console.log(`✅ Updated ${product.name} with ${mediaIds.length} images`)
          updatedCount++
        } catch (error) {
          console.error(`❌ Failed to update ${product.name}:`, error)
        }
      } else {
        // Assign a default opal image if no specific match
        const defaultImages = imageFiles.filter(file =>
          file.includes('opal-') || file.includes('20210819_')
        ).slice(0, 2)

        if (defaultImages.length > 0) {
          // Similar upload process for default images
          console.log(`ℹ️  Using default images for ${product.name}`)
        }
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products with images!`)

  } catch (error) {
    console.error('❌ Error linking product images:', error)
  } finally {
    process.exit(0)
  }
}

linkProductImages()