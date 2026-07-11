interface ProductGalleryImage {
  alt: string
  url: string
}

const legacyGalleryBySlug: Record<string, readonly string[]> = {
  'freeform-doublet-parcel-2-3-cts': ['/images/products/IMG_0801.jpg'],
  'mintabie-carved-heart': ['/images/products/IMG_0783.jpg'],
  'freeform-doublet-parcel-3-85-cts': ['/images/products/20220109_132428-1.jpg'],
  'jewellers-opal-parcel-2-70-cts': ['/images/products/20211104_234857.jpg'],
  'lightning-ridge-white-opal-1-70-cts-2': ['/images/products/20211104_231959.jpg'],
  'lightning-ridge-black-opal-parcel-1-50-cts': ['/images/products/20211104_233344.jpg'],
  'queensland-boulder-opal-parcel-8-95-cts': ['/images/products/20210923_163309.jpg'],
  'premium-calibrated-opal-doublets-priced-individually': [
    '/images/products/20210911_190618-1.jpg',
  ],
  'gemini-ring-2': ['/images/products/20210819_102417.jpg'],
  'gemini-ring-1': ['/images/products/20210819_102712.jpg'],
  'coral-ring-2': [
    '/images/products/20210819_102402-1.jpg',
    '/images/products/20210819_101705.jpg',
  ],
  'coral-ring-1': ['/images/products/20210819_101524.jpg', '/images/products/20210819_102831.jpg'],
  'sun-and-moon-ring-1': ['/images/products/20210819_101835.jpg'],
  'lightning-ridge-crystal-opal-parcel-5-20-copy': [
    '/images/products/20210705_104433-e1625472581256.jpg',
  ],
  'coober-pedy-white-opal-2-30-cts-copy': ['/images/products/20210606_144451.jpg'],
  'premium-calibrated-triplet-opal-medium-2': ['/images/products/20210911_191436-1.jpg'],
  'mintabie-semi-black-opal-6-80-cts': ['/images/products/20210523_092032.jpg'],
  'large-koroit-boulder-opal-specimen': ['/images/products/20210428_111207.jpg'],
  'coober-pedy-white-opal-6-35-cts': ['/images/products/20211129_164351-1-1.jpg'],
  'lightning-ridge-crystal-opal-parcel': ['/images/products/20210419_100848.png'],
  'lightning-ridge-black-opal-1-25-ct': [
    '/images/products/20210505_103530.jpg',
    '/images/products/20210322_110201.png',
    '/images/products/20210627_192839.jpg',
    '/images/products/20210627_193259.jpg',
  ],
  'lightning-ridge-semi-black-opal-5-50-cts': [
    '/images/products/20200913_153729-scaled.jpg',
    '/images/products/20200913_153756.png',
  ],
  'lightning-ridge-semi-black-opal-1-40-cts': ['/images/products/20200913_161846.jpg'],
}

function filename(url: string): string {
  try {
    return new URL(url, 'https://catalogue.local').pathname.split('/').at(-1) ?? url
  } catch {
    return url
  }
}

export function legacyGalleryImageCount(): number {
  return Object.values(legacyGalleryBySlug).reduce((count, images) => count + images.length, 0)
}

export function legacyGalleryAssetPaths(): string[] {
  return Array.from(new Set(Object.values(legacyGalleryBySlug).flat()))
}

export function mergeProductGallery(
  slug: string,
  productName: string,
  cmsImages: readonly ProductGalleryImage[]
): ProductGalleryImage[] {
  const merged = [...cmsImages]
  const filenames = new Set(cmsImages.map((image) => filename(image.url)))

  for (const url of legacyGalleryBySlug[slug] ?? []) {
    const imageFilename = filename(url)
    if (filenames.has(imageFilename)) continue
    filenames.add(imageFilename)
    merged.push({ url, alt: `${productName} additional view` })
  }

  return merged
}
