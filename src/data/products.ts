/**
 * Demo Products Data
 * Replace with CMS fetch when database is populated
 */

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  stock: number
  featured?: boolean
  category?: string
}

export const DEMO_PRODUCTS: Product[] = [
  {
    id: '1',
    slug: 'black-opal-ring-sterling-silver',
    name: 'Lightning Ridge Black Opal Ring',
    description: 'Stunning black opal from Lightning Ridge set in sterling silver with intricate band detailing',
    price: 1899.00,
    compareAtPrice: 2299.00,
    stock: 1,
    featured: true,
    category: 'opal-rings',
  },
  {
    id: '2',
    slug: 'boulder-opal-pendant-gold',
    name: 'Queensland Boulder Opal Pendant',
    description: 'Natural boulder opal showcasing vibrant greens and blues in 14K gold setting',
    price: 2499.00,
    stock: 1,
    featured: true,
    category: 'opal-necklaces',
  },
  {
    id: '3',
    slug: 'crystal-opal-stud-earrings',
    name: 'Crystal Opal Stud Earrings',
    description: 'Delicate crystal opal studs with rainbow fire, set in rose gold',
    price: 1299.00,
    stock: 2,
    featured: false,
    category: 'opal-earrings',
  },
  {
    id: '4',
    slug: 'white-opal-bracelet',
    name: 'Coober Pedy White Opal Bracelet',
    description: 'Elegant bracelet featuring five matched white opals in sterling silver links',
    price: 1799.00,
    compareAtPrice: 2199.00,
    stock: 1,
    featured: false,
    category: 'opal-bracelets',
  },
  {
    id: '5',
    slug: 'fire-opal-statement-ring',
    name: 'Fire Opal Statement Ring',
    description: 'Vibrant orange fire opal in bold 18K gold setting',
    price: 3299.00,
    stock: 1,
    featured: true,
    category: 'opal-rings',
  },
  {
    id: '6',
    slug: 'raw-black-opal-collectors',
    name: 'Raw Black Opal - Collector Grade',
    description: 'Unset Lightning Ridge black opal, 8.5ct with exceptional color play',
    price: 4500.00,
    stock: 1,
    featured: false,
    category: 'raw-opals',
  },
  {
    id: '7',
    slug: 'matrix-opal-pendant',
    name: 'Andamooka Matrix Opal Pendant',
    description: 'Unique matrix opal with natural patterns in sterling silver',
    price: 899.00,
    stock: 3,
    featured: false,
    category: 'opal-necklaces',
  },
  {
    id: '8',
    slug: 'crystal-opal-ring-platinum',
    name: 'Crystal Opal Ring - Platinum',
    description: 'Premium crystal opal set in platinum with diamond accents',
    price: 5999.00,
    stock: 1,
    featured: true,
    category: 'opal-rings',
  },
]

// Helper functions
export function getProductsByCategory(category: string = 'all'): Product[] {
  if (category === 'all') return DEMO_PRODUCTS
  return DEMO_PRODUCTS.filter(p => p.category === category)
}

export function sortProducts(products: Product[], sort: string = 'featured'): Product[] {
  const sorted = [...products]

  switch (sort) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'featured':
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return 0
      })
    default:
      return sorted
  }
}
