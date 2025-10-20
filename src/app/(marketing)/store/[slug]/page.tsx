import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container, Section } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { ProductActions } from '@/components/product/ProductActions'
import { formatCurrency } from '@/lib/utils'
import {
  StockBadge,
  NewBadge,
  AuthenticityChecklist,
  SocialProof,
  PaymentBadgesCompact,
} from '@/components/trust'
import { DEMO_PRODUCTS } from '@/data/products'
import { getCategoryGradient } from '@/data/categories'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params

  // TODO: Fetch from Payload API when products are created
  const product = DEMO_PRODUCTS.find((p) => p.slug === slug)

  if (!product) {
    notFound()
  }

  // Simulated social proof (would come from analytics)
  const viewCount = Math.floor(Math.random() * 20) + 5
  const lastSoldDaysAgo = product.stock < 5 ? Math.floor(Math.random() * 3) : undefined

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
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-warm-grey-light">
                {product.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div className={`absolute inset-0 ${getCategoryGradient(product.category)}`}>
                    <div className="absolute inset-0 flex items-center justify-center text-9xl opacity-70">
                      💎
                    </div>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                  <div className="flex flex-col gap-2">
                    {product.featured && <NewBadge />}
                  </div>
                  {product.stock <= 10 && product.stock > 0 && (
                    <StockBadge stock={product.stock} />
                  )}
                </div>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center">
                <SocialProof viewCount={viewCount} lastSoldDaysAgo={lastSoldDaysAgo} />
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <p className="text-sm text-opal-blue font-semibold uppercase tracking-wide mb-2">
                  {product.category?.replace('-', ' ')}
                </p>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 pb-6 border-b border-warm-grey">
                <span className="text-4xl font-bold text-opal-blue">
                  {formatCurrency(product.price, 'USD')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-xl text-charcoal-60 line-through">
                      {formatCurrency(product.compareAtPrice, 'USD')}
                    </span>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-error text-white text-sm font-bold">
                      SAVE {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                    </div>
                  </>
                )}
              </div>

              {/* Description */}
              <div className="text-charcoal-80 leading-relaxed">
                <p className="text-lg">{product.description}</p>
              </div>

              {/* Authenticity Checklist */}
              <div className="py-6 border-y border-warm-grey">
                <AuthenticityChecklist />
              </div>

              {/* Product Actions */}
              <ProductActions
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                }}
              />

              {/* Payment Security */}
              <div className="pt-6 border-t border-warm-grey">
                <PaymentBadgesCompact />
              </div>

              {/* Shipping Info */}
              <div className="p-4 bg-opal-blue-pale rounded-lg">
                <p className="text-sm text-charcoal-80">
                  <span className="font-semibold">Free shipping</span> on orders over $500 AUD •
                  <span className="font-semibold"> 30-day returns</span> •
                  <span className="font-semibold"> Arrives in 3-7 business days</span>
                </p>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          {(product.origin || product.stoneType || product.metal || product.weight) && (
            <div className="mt-16 border-t border-warm-grey pt-12">
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">
                Specifications
              </h2>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                {product.stoneType && (
                  <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                    <span className="text-charcoal-60">Stone Type</span>
                    <span className="font-semibold text-charcoal">{product.stoneType}</span>
                  </div>
                )}
                {product.origin && (
                  <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                    <span className="text-charcoal-60">Origin</span>
                    <span className="font-semibold text-charcoal">{product.origin}</span>
                  </div>
                )}
                {product.metal && (
                  <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                    <span className="text-charcoal-60">Metal</span>
                    <span className="font-semibold text-charcoal">{product.metal}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between items-center py-3 border-b border-warm-grey-light">
                    <span className="text-charcoal-60">Weight</span>
                    <span className="font-semibold text-charcoal">{product.weight} carats</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Container>
      </Section>
      </main>
      <Footer />
    </div>
  )
}

// Generate static params for all products
export async function generateStaticParams() {
  return DEMO_PRODUCTS.map((product) => ({
    slug: product.slug,
  }))
}
