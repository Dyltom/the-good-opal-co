import { classifyOpalListing, isAvailableOpalListing } from '@/lib/custom-builder/opal-visual'

interface BuilderCatalogueProduct {
  builderMappingStatus?: string | null
  name: string
}

const imageAltOverrides: Readonly<Record<string, string>> = {
  'queensland-boulder-opal-20-cts': 'Queensland Boulder Opal 20 cts',
}

export function shouldIncludeBuilderCatalogueProduct(product: BuilderCatalogueProduct): boolean {
  if (!isAvailableOpalListing(product.name)) return false
  if (classifyOpalListing(product.name) !== 'individual') return true

  return product.builderMappingStatus === 'reviewed' || product.builderMappingStatus === 'manual'
}

export function resolveBuilderCatalogueImageUrl(
  mappedMediaUrl: string | undefined,
  reviewedFallbackUrl: string | undefined,
  ownedFallbackUrl: string | undefined,
  filenameFallbackUrl: string | undefined
): string | undefined {
  return mappedMediaUrl ?? reviewedFallbackUrl ?? ownedFallbackUrl ?? filenameFallbackUrl
}

export function builderCatalogueImageAlt(
  slug: string,
  productName: string,
  mappedMediaAlt?: string | null
): string {
  const mappedAlt = mappedMediaAlt?.trim()
  return imageAltOverrides[slug] ?? (mappedAlt || productName)
}
