'use client'

import { useState, ViewTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { productImageTransitionName } from '@/lib/view-transitions'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { storeLabel } from '@/app/(marketing)/store/store-query'

const ProductQuickViewModal = dynamic(() =>
  import('./ProductQuickViewModal').then((mod) => mod.ProductQuickViewModal)
)

interface ProductCardProduct {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  stock: number
  featured?: boolean
  category?: string
  image?: string
  stoneOrigin?: string
  stoneType?: string
  carats?: number
}

interface ProductCardProps {
  product: ProductCardProduct
  index?: number
  priority?: boolean
}

function stoneDetails(product: ProductCardProduct): string[] {
  return [
    product.stoneType && storeLabel(product.stoneType),
    product.stoneOrigin && storeLabel(product.stoneOrigin).split(',')[0],
  ].filter((value): value is string => Boolean(value))
}

export function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false)
  const isAvailable = product.stock > 0
  const productHref = `/store/${product.slug}`
  const details = stoneDetails(product)
  const onSale = Boolean(product.compareAtPrice && product.compareAtPrice > product.price)
  const discount = onSale
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0
  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
  }

  return (
    <>
      <article className="group relative">
        <div className="relative overflow-hidden rounded-md bg-cream-dark">
          <Link
            href={productHref}
            className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
          >
            <ViewTransition name={productImageTransitionName(product.slug)}>
              <div className="relative aspect-[4/5]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    priority={priority && index < 4}
                    fetchPriority={priority && index < 2 ? 'high' : undefined}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={
                      isAvailable
                        ? 'object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100'
                        : 'object-cover opacity-70 grayscale'
                    }
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-sans text-xs text-charcoal/50">
                    Photo coming soon
                  </div>
                )}
              </div>
            </ViewTransition>
          </Link>

          {isAvailable ? (
            <>
              <div className="absolute inset-x-3 bottom-3 hidden items-center gap-2 opacity-100 transition-[opacity,transform] duration-500 ease-out-expo sm:flex sm:translate-y-2 sm:opacity-0 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 motion-reduce:transition-none motion-reduce:sm:translate-y-0">
                <AddToCartButton
                  product={cartProduct}
                  variant="minimal"
                  size="sm"
                  className="flex-1 justify-center rounded-md bg-white/95 text-charcoal shadow-sm hover:bg-white"
                >
                  Quick add
                </AddToCartButton>
                <button
                  type="button"
                  onClick={() => setShowQuickView(true)}
                  title="Quick view"
                  aria-label={`Open quick view for ${product.name}`}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-white/95 text-charcoal/80 shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                >
                  <Eye size={18} aria-hidden="true" />
                </button>
              </div>
              <AddToCartButton
                product={cartProduct}
                variant="icon"
                size="sm"
                className="absolute bottom-2 right-2 bg-white/95 sm:hidden"
              />
            </>
          ) : (
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-charcoal/85 px-3 py-1 font-sans text-xs font-medium text-white">
              Collected
            </span>
          )}
        </div>

        <div className="pt-3">
          <h3 className="line-clamp-2 font-serif text-[1.05rem] leading-snug text-charcoal">
            <Link
              href={productHref}
              className="rounded-sm transition-colors hover:text-opal-electric-accessible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              {product.name}
            </Link>
          </h3>
          {details.length > 0 ? (
            <p className="mt-1 font-sans text-xs leading-5 text-charcoal/60">{details.join(' · ')}</p>
          ) : null}
          <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 font-sans tabular-nums">
            {isAvailable ? (
              <>
                <span className="text-base font-semibold text-charcoal">
                  {formatCurrency(product.price, 'AUD')}
                </span>
                {onSale ? (
                  <>
                    <span className="text-sm text-charcoal/45 line-through">
                      {formatCurrency(product.compareAtPrice!, 'AUD')}
                    </span>
                    <span className="text-xs font-medium text-fire-pink-dark">Save {discount}%</span>
                  </>
                ) : null}
              </>
            ) : (
              <span className="text-sm font-medium text-charcoal/60">Collected</span>
            )}
            {product.carats ? (
              <span className="ml-auto text-xs text-charcoal/60">{product.carats} ct</span>
            ) : null}
          </p>
          {isAvailable && product.stock > 1 && product.stock <= 3 ? (
            <p className="mt-1 font-sans text-xs font-medium text-opal-emerald-dark">
              Only {product.stock} left
            </p>
          ) : null}
        </div>
      </article>

      {showQuickView ? (
        <ProductQuickViewModal product={product} isOpen onClose={() => setShowQuickView(false)} />
      ) : null}
    </>
  )
}
