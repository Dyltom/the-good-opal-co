/**
 * Product Categories Data
 * Centralized category definitions for consistency
 */

export interface ProductCategory {
  name: string
  slug: string
  description: string
  gradient: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    name: 'Opal Rings',
    slug: 'opal-rings',
    description: 'Statement pieces & everyday elegance',
    gradient: 'bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400',
  },
  {
    name: 'Necklaces & Pendants',
    slug: 'opal-necklaces',
    description: 'Elegant pieces showcasing opal fire',
    gradient: 'bg-gradient-to-br from-teal-400 via-cyan-400 to-blue-400',
  },
  {
    name: 'Opal Earrings',
    slug: 'opal-earrings',
    description: 'Delicate studs & statement drops',
    gradient: 'bg-gradient-to-br from-pink-400 via-rose-400 to-orange-400',
  },
  {
    name: 'Opal Bracelets',
    slug: 'opal-bracelets',
    description: 'Elegant wrist adornments',
    gradient: 'bg-gradient-to-br from-indigo-400 via-blue-400 to-teal-400',
  },
  {
    name: 'Raw Opals',
    slug: 'raw-opals',
    description: 'Unset stones for collectors',
    gradient: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500',
  },
  {
    name: 'Custom Commissions',
    slug: 'custom-commissions',
    description: 'Bespoke jewelry design',
    gradient: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800',
  },
]

export const CATEGORY_FILTERS = [
  { label: 'All Jewelry', value: 'all' },
  ...PRODUCT_CATEGORIES.map(cat => ({ label: cat.name, value: cat.slug })),
]

// Get category gradient by slug
export function getCategoryGradient(categorySlug?: string): string {
  const category = PRODUCT_CATEGORIES.find(c => c.slug === categorySlug)
  return category?.gradient || 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400'
}

// Get category name by slug
export function getCategoryName(categorySlug?: string): string {
  const category = PRODUCT_CATEGORIES.find(c => c.slug === categorySlug)
  return category?.name || 'All Jewelry'
}
