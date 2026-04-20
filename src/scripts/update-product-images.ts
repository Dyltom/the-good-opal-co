import { getPayload } from '../lib/payload'

/**
 * Updates products with image URLs based on product names and available images
 */
async function updateProductImages() {
  try {
    console.log('🖼️  Updating product images...\n')

    const payload = await getPayload()

    // Get all products
    const { docs: products } = await payload.find({
      collection: 'products',
      limit: 200,
      depth: 0
    })

    console.log(`Found ${products.length} products to update\n`)

    // Image mapping based on product types and names
    const imageUrls: Record<string, string[]> = {
      // Black Opals
      'Lightning Ridge Black Opal': [
        '/images/products/20211104_234957-3.jpg',
        '/images/products/20211104_234659-1-4.jpg',
        '/images/products/20211104_233426-3.jpg',
        '/images/products/20211104_232150-3.jpg'
      ],
      'Black Opal Parcel': [
        '/images/products/20211104_231937-3.jpg',
        '/images/products/20211104_234224-3.jpg',
        '/images/products/20211104_234430-3.jpg',
        '/images/products/20211104_234025-3.jpg'
      ],
      'Lightning Ridge Black Crystal Opal': [
        '/images/products/20211104_232559-3.jpg',
        '/images/products/20211104_233233-3.jpg',
        '/images/products/20211104_232926-3.jpg'
      ],
      'Lightning Ridge Semi Black Opal': [
        '/images/products/20211104_232342-3.jpg',
        '/images/products/20211104_230316-3.jpg'
      ],

      // Crystal Opals
      'Lightning Ridge Crystal Opal': [
        '/images/products/IMG_0774-3.jpg',
        '/images/products/IMG_0810-3.jpg',
        '/images/products/IMG_0803-3.jpg',
        '/images/products/IMG_0779-3.jpg'
      ],
      'Crystal Opal': [
        '/images/products/20220109_132526-4.jpg',
        '/images/products/20220109_133155-3.jpg',
        '/images/products/20220109_133519-3.jpg',
        '/images/products/20220109_133657-3.jpg'
      ],
      'Andamooka Opal': [
        '/images/products/20210119_132504-scaled-e1614300991943-3.jpg',
        '/images/products/20210217_114935-scaled-e1616022769534-3.jpg'
      ],

      // White Opals
      'Lightning Ridge White Opal': [
        '/images/products/IMG_5903-3.jpg',
        '/images/products/IMG_5904-3.jpg',
        '/images/products/IMG-0741-4.jpg'
      ],
      'Coober Pedy White Opal': [
        '/images/products/20210627_202327-3.jpg',
        '/images/products/20210627_202949-3.jpg',
        '/images/products/20210627_192839-3.jpg'
      ],
      'Mintabie White Opal': [
        '/images/products/20210612_165338-e1623583381523-3.jpg',
        '/images/products/20210612_162356-e1623583224296-3.jpg'
      ],

      // Boulder Opals
      'Queensland Boulder Opal': [
        '/images/products/20210217_121854-scaled-e1614302386358-3.jpg',
        '/images/products/20210217_115308-scaled-e1614308850915-3.jpg',
        '/images/products/20210217_163518-scaled-e1614309262679-3.jpg'
      ],
      'Boulder Opal': [
        '/images/products/20210428_110715.jpg',
        '/images/products/20210505_102859.jpg',
        '/images/products/20210505_103931-3.png'
      ],

      // Special/Carved pieces
      'Carved Heart': [
        '/images/products/heartthing-4.jpg',
        '/images/products/heart-opal-pendant.jpg'
      ],
      'heart': [
        '/images/products/20210612_163955-e1623581983869-3.jpg',
        '/images/products/20210606_145446-3.jpg'
      ],

      // Rings
      'Aurora Ring': [
        '/images/products/opal-ring-1.jpg',
        '/images/products/opal-ring-2.jpg'
      ],
      'Sun and Moon Ring': [
        '/images/products/20210819_102201-3.jpg',
        '/images/products/20210819_102300-7.jpg',
        '/images/products/20210819_102346-3.jpg'
      ],
      'Coral Ring': [
        '/images/products/20210819_102625-4.jpg',
        '/images/products/20210819_102749-7.jpg'
      ],
      'Gemini Ring': [
        '/images/products/20211129_164004-1-4.jpg',
        '/images/products/20211129_164200-1-1.jpg',
        '/images/products/20211129_164407-1-1.jpg'
      ],
      'Opal Ring': [
        '/images/products/20210819_101509-7.jpg',
        '/images/products/20210819_101746-7.jpg',
        '/images/products/20210819_101941-7.jpg'
      ],

      // Pendants/Necklaces
      'Pendant': [
        '/images/products/20210714_171016-e1626258257167-3.jpg',
        '/images/products/20210714_171456-e1626259098987-3.jpg',
        '/images/products/20210714_171803-e1626258427260-3.jpg'
      ],
      'Teardrop': [
        '/images/products/20210714_172106-e1626258929243-3.jpg',
        '/images/products/20210809_180424-e1628508926314-3.jpg',
        '/images/products/20210809_180732-e1628507555741-3.jpg'
      ],

      // Doublets and Triplets
      'Doublet': [
        '/images/products/20210809_181013-e1628504859538-3.jpg',
        '/images/products/20210809_181553-e1628503486464-3.jpg',
        '/images/products/20210809_181757-e1628507947884-3.jpg'
      ],
      'Triplet': [
        '/images/products/20210809_182017-e1628503974155-3.jpg',
        '/images/products/20210809_182256-e1628508066813-3.jpg',
        '/images/products/20210809_182611-1-e1628506218857-3.jpg'
      ],

      // Parcels
      'Parcel': [
        '/images/products/20210912_202757-4.jpg',
        '/images/products/20210923_155700.jpg',
        '/images/products/20210923_161001.jpg',
        '/images/products/20210923_163244.jpg'
      ],
      'Jeweller': [
        '/images/products/20210923_163402-3.jpg',
        '/images/products/20210923_172817-3.jpg',
        '/images/products/20210923_173709-3.jpg'
      ],

      // Premium pieces
      'Premium': [
        '/images/products/20211129_165305-4.jpg',
        '/images/products/20211012_173801-3.jpg',
        '/images/products/20211012_174507-4.jpg',
        '/images/products/20211012_174237-3.jpg'
      ],
      'Fossil Opal': [
        '/images/products/20211012_170220-1-1.jpg',
        '/images/products/20211012_171941-4.jpg',
        '/images/products/20211012_173350.jpg'
      ],

      // Default high-quality opals
      'default': [
        '/images/products/opal-1.jpg',
        '/images/products/opal-2.jpg',
        '/images/products/opal-3.jpg',
        '/images/products/opal-4.jpg',
        '/images/products/opal-5.jpg',
        '/images/products/opal-6.jpg',
        '/images/products/opal-7.jpg'
      ]
    }

    // First upload all unique images to media collection
    const uploadedMedia: Record<string, string> = {}
    const allImageUrls = new Set<string>()

    // Collect all unique image URLs
    Object.values(imageUrls).forEach(urls => {
      urls.forEach(url => allImageUrls.add(url))
    })

    console.log(`Processing ${allImageUrls.size} unique images...`)

    for (const imageUrl of allImageUrls) {
      const filename = imageUrl.split('/').pop()!

      // Check if media already exists
      const existingMedia = await payload.find({
        collection: 'media',
        where: {
          filename: {
            equals: filename
          }
        },
        limit: 1
      })

      if (existingMedia.docs.length > 0) {
        uploadedMedia[imageUrl] = existingMedia.docs[0].id
      } else {
        // Create new media entry
        const media = await payload.create({
          collection: 'media',
          data: {
            filename,
            alt: `Australian Opal - ${filename}`,
            url: imageUrl,
            mimeType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
            filesize: 100000, // Approximate
            width: 800,
            height: 800
          }
        })
        uploadedMedia[imageUrl] = media.id
      }
    }

    console.log('✅ Media entries created/verified\n')

    // Update products
    let updatedCount = 0

    for (const product of products) {
      let matchedImages: string[] = []

      // Find matching images based on product name
      for (const [keyword, urls] of Object.entries(imageUrls)) {
        if (keyword === 'default') continue

        if (product.name.includes(keyword)) {
          matchedImages = urls
          break
        }
      }

      // Use default images if no match found
      if (matchedImages.length === 0) {
        const defaultImages = imageUrls.default
        matchedImages = defaultImages.slice(0, 3)
      }

      // Update product with media references
      if (matchedImages.length > 0) {
        try {
          const imageData = matchedImages.slice(0, 4).map(url => ({
            image: uploadedMedia[url]
          }))

          await payload.update({
            collection: 'products',
            id: product.id,
            data: {
              images: imageData
            }
          })

          console.log(`✅ Updated ${product.name} with ${imageData.length} images`)
          updatedCount++
        } catch (error) {
          console.error(`❌ Failed to update ${product.name}:`, error)
        }
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products with images!`)

  } catch (error) {
    console.error('❌ Error updating product images:', error)
  } finally {
    process.exit(0)
  }
}

updateProductImages()