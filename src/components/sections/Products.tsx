import Link from 'next/link'
import Image from 'next/image'
import { Container, Grid, Section } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from './SectionHeader'
import { formatCurrency } from '@/lib/utils'

/**
 * Product type for display
 */
interface Product {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  images?: Array<{ id: string; url: string; alt: string }>
  featured?: boolean
  stock?: number
}

/**
 * Products Section Props
 */
interface ProductsSectionProps {
  title?: string
  description?: string
  products: Product[]
  columns?: 2 | 3 | 4
  showPrice?: boolean
  currency?: string
}

/**
 * Products Section Component
 * Display products in a grid for ecommerce
 */
export function Products({
  title = 'Our Products',
  description,
  products,
  columns = 3,
  showPrice = true,
  currency = 'USD',
}: ProductsSectionProps) {
  if (products.length === 0) return null

  return (
    <Section padding="lg">
      <Container>
        <SectionHeader title={title} description={description} />

        {/* Products Grid */}
        <Grid cols={columns} gap="lg">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/products/${product.slug}`}>
                {/* Product Image */}
                {product.images && product.images.length > 0 && product.images[0] && (
                  <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      fill
                      className="object-cover"
                    />
                    {product.featured && (
                      <Badge className="absolute top-2 right-2">Featured</Badge>
                    )}
                    {product.stock !== undefined && product.stock === 0 && (
                      <Badge variant="destructive" className="absolute top-2 left-2">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                )}

                <div className="p-4">
                  {/* Product Name */}
                  <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>

                  {/* Description */}
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {/* Price */}
                  {showPrice && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold">
                        {formatCurrency(product.price, currency)}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(product.compareAtPrice, currency)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <Button
                    className="w-full"
                    disabled={product.stock !== undefined && product.stock === 0}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'View Details'}
                  </Button>
                </div>
              </Link>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
