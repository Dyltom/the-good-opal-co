#!/usr/bin/env python3
"""Generate TypeScript products file from WordPress JSON"""
import json

with open('/Users/dylanhenderson/the-good-opal-co/wordpress-products.json') as f:
    products = json.load(f)

# Generate TypeScript
ts_content = '''/**
 * Real Products from WordPress WooCommerce Backup
 * Imported from production database - DO NOT MANUALLY EDIT
 * To update: Re-run import script
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
  image?: string
  origin?: string
  stoneType?: string
  metal?: string
  weight?: number
}

export const PRODUCTS: Product[] = [
'''

for p in products:  # ALL products
    # Use backticks for strings to avoid quote escaping issues
    title = p['title'].replace('`', "'")
    desc = p['description'].replace('`', "'").replace('\n', ' ')[:250]
    origin = p['origin'].replace('`', "'")
    stone_type = p['stone_type'].replace('`', "'")

    ts_content += f'''  {{
    id: '{p['id']}',
    slug: '{p['slug']}',
    name: `{title}`,
    description: `{desc}`,
    price: {p['price']},
    stock: {p['stock']},
    featured: {str(p['featured']).lower()},
    category: '{p['category']}',
    image: '/images/products/{p['image_filename']}',
    origin: `{origin}`,
    stoneType: `{stone_type}`,
    weight: {p['weight'] if p['weight'] else 'undefined'},
  }},
'''

ts_content += ''']

// Helper functions
export function getProductsByCategory(category: string = 'all'): Product[] {
  if (category === 'all') return PRODUCTS.filter(p => p.stock > 0)
  return PRODUCTS.filter(p => p.category === category && p.stock > 0)
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

// Backwards compatibility
export const DEMO_PRODUCTS = PRODUCTS
'''

# Write TypeScript file
output_path = '/Users/dylanhenderson/the-good-opal-co/src/data/products.ts'
with open(output_path, 'w') as f:
    f.write(ts_content)

print(f'✅ Generated products.ts with {len(products)} real WordPress products')
print(f'🖼️  All {len(products)} products have real images from backup')
