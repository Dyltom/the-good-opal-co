import type { CatalogProduct } from '../catalog'

export function catalogProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: '1',
    name: 'Blue opal',
    slug: 'blue-opal',
    url: 'https://example.com/store/blue-opal',
    description: 'A bright blue opal.',
    summary: 'A bright blue opal.',
    price: 123,
    stock: 1,
    availability: 'in_stock',
    images: ['https://example.com/blue.jpg'],
    sku: 'WP-1',
    category: 'raw-opals',
    categoryLabel: 'Raw opals',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }
}
