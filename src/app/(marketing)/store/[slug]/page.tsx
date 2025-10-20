import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Badge } from '@/components/ui/badge'
import { ProductActions } from '@/components/product/ProductActions'
import { formatCurrency } from '@/lib/utils'

// Demo products (same as store page)
const demoProducts = [
  {
    id: '1',
    slug: 'premium-coffee-beans',
    name: 'Premium Coffee Beans',
    description: 'Organic, fair-trade coffee beans sourced from the highlands of Colombia. Rich, smooth flavor with notes of chocolate and caramel.',
    longDescription: 'Our Premium Coffee Beans are carefully sourced from sustainable farms in Colombia. Each batch is roasted to perfection to bring out the unique flavor profile. Perfect for pour-over, French press, or espresso.',
    price: 24.99,
    compareAtPrice: 29.99,
    stock: 50,
    featured: true,
    sku: 'COF-001',
  },
  {
    id: '2',
    slug: 'artisan-tea-collection',
    name: 'Artisan Tea Collection',
    description: 'A curated selection of premium loose-leaf teas from around the world.',
    longDescription: 'This collection includes 5 unique tea varieties: Green Tea, Black Tea, Oolong, White Tea, and Herbal Blend. Each tea is hand-selected for quality and flavor.',
    price: 34.99,
    stock: 30,
    featured: true,
    sku: 'TEA-001',
  },
  {
    id: '3',
    slug: 'handcrafted-mug',
    name: 'Handcrafted Mug',
    description: 'Beautiful ceramic mug handmade by local artisans.',
    longDescription: 'Each mug is unique, crafted by skilled artisans using traditional techniques. Microwave and dishwasher safe. Holds 12oz.',
    price: 18.99,
    stock: 25,
    sku: 'MUG-001',
  },
  {
    id: '4',
    slug: 'french-press',
    name: 'French Press Coffee Maker',
    description: 'Premium stainless steel french press',
    longDescription: 'Professional-grade French press with double-wall insulation to keep coffee hot. Makes 8 cups (34oz). Easy to clean and built to last.',
    price: 45.99,
    stock: 15,
    sku: 'FRP-001',
  },
  {
    id: '5',
    slug: 'tea-infuser-set',
    name: 'Tea Infuser Set',
    description: 'Set of 3 premium stainless steel infusers',
    longDescription: 'Three different sizes for perfect steeping. Fine mesh design for loose leaf teas. Easy to clean and dishwasher safe.',
    price: 22.99,
    stock: 40,
    sku: 'INF-001',
  },
  {
    id: '6',
    slug: 'coffee-grinder',
    name: 'Burr Coffee Grinder',
    description: 'Professional grade burr grinder',
    longDescription: 'Precision burr grinding with 18 settings from coarse to fine. Quiet operation and consistent grind size. Essential for serious coffee lovers.',
    price: 89.99,
    compareAtPrice: 99.99,
    stock: 10,
    featured: true,
    sku: 'GRN-001',
  },
]

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params

  // TODO: Fetch from Payload API
  // const payload = await getPayload({ config })
  // const products = await payload.find({
  //   collection: 'products',
  //   where: { slug: { equals: slug } },
  //   limit: 1,
  // })
  // if (!products.docs.length) notFound()
  // const product = products.docs[0]

  const product = demoProducts.find((p) => p.slug === slug)

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation logoText="Rapid Sites" items={[{ href: '/', label: 'Home' }, { href: '/store', label: 'Store' }]} />
      <main className="flex-1">
        {/* Breadcrumb */}
        <Section padding="sm">
        <Container>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/store" className="hover:text-primary">
              Store
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </Container>
      </Section>

      {/* Product Detail */}
      <Section padding="lg">
        <Container>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center text-9xl">
                {product.name.includes('Coffee') && '☕'}
                {product.name.includes('Tea') && '🍵'}
                {product.name.includes('Mug') && '🍺'}
                {product.name.includes('Grinder') && '⚙️'}
                {product.name.includes('Press') && '🫖'}
                {product.name.includes('Infuser') && '🌿'}
              </div>
              {product.featured && (
                <Badge className="absolute top-4 right-4">Featured</Badge>
              )}
              {product.compareAtPrice && (
                <Badge variant="destructive" className="absolute top-4 left-4">
                  Sale
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold">
                  {formatCurrency(product.price, 'USD')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatCurrency(product.compareAtPrice, 'USD')}
                  </span>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <Badge variant="destructive">
                    Save {formatCurrency(product.compareAtPrice - product.price, 'USD')}
                  </Badge>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 20 && (
                  <p className="text-success font-medium">
                    ✓ In Stock - {product.stock} available
                  </p>
                )}
                {product.stock > 0 && product.stock <= 20 && (
                  <p className="text-warning font-medium">
                    ⚠️ Low Stock - Only {product.stock} left!
                  </p>
                )}
                {product.stock === 0 && (
                  <p className="text-destructive font-medium">✗ Out of Stock</p>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none mb-8">
                <p className="text-lg text-muted-foreground mb-4">{product.description}</p>
                {product.longDescription && (
                  <p className="text-muted-foreground">{product.longDescription}</p>
                )}
              </div>

              {/* SKU */}
              <p className="text-sm text-muted-foreground mb-6">SKU: {product.sku}</p>

              {/* Product Actions - Quantity Selector + Add to Cart */}
              <ProductActions
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                }}
              />

              {/* Features */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-4">Product Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Premium quality guaranteed</li>
                  <li>✓ Fast shipping available</li>
                  <li>✓ 30-day return policy</li>
                  <li>✓ Secure checkout with Stripe</li>
                </ul>
              </div>

              {/* Ecommerce Info */}
              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm font-semibold mb-2">🛒 Powered by Payload Ecommerce Plugin</p>
                <p className="text-xs text-muted-foreground">
                  This store uses Payload CMS ecommerce plugin with Orders, Carts, Variants, and Stripe integration.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      </main>
      <Footer />
    </div>
  )
}

// Generate static params for all products
export async function generateStaticParams() {
  return demoProducts.map((product) => ({
    slug: product.slug,
  }))
}
