import fallbackProducts from '../../data/wordpress-products.json'

interface FallbackProductRecord {
  available: boolean
  category: string
  compare_at_price: number | null
  description: string
  id: string
  image_filename: string
  image_url: string
  price: number
  slug: string
  title: string
}

export interface Product {
  available: boolean
  category?: string
  compareAtPrice?: number
  description: string
  featured?: boolean
  id: string
  image?: string
  imageSourceUrl?: string
  name: string
  price: number
  slug: string
}

/**
 * Checked-in recovery catalogue generated from the public WooCommerce Store API.
 * It records availability but deliberately carries no synthetic stock quantity.
 */
export const PRODUCTS: Product[] = (fallbackProducts as FallbackProductRecord[]).map((product) => ({
  available: product.available,
  category: product.category,
  ...(product.compare_at_price === null ? {} : { compareAtPrice: product.compare_at_price }),
  description: product.description,
  id: product.id,
  image: `/images/products/${product.image_filename}`,
  imageSourceUrl: product.image_url,
  name: product.title,
  price: product.price,
  slug: product.slug,
}))

export function getProductsByCategory(category = 'all'): Product[] {
  if (category === 'all') return PRODUCTS.filter((product) => product.available)
  return PRODUCTS.filter((product) => product.category === category && product.available)
}

export function sortProducts(products: Product[], sort = 'featured'): Product[] {
  const sorted = [...products]

  switch (sort) {
    case 'price-low':
      return sorted.sort((left, right) => left.price - right.price)
    case 'price-high':
      return sorted.sort((left, right) => right.price - left.price)
    case 'featured':
      return sorted.sort(
        (left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured))
      )
    default:
      return sorted
  }
}

export const DEMO_PRODUCTS = PRODUCTS
