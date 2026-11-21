'use client'

import { useState, ViewTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Eye } from 'lucide-react'
import { formatCurrency, savePercent } from '@/lib/utils'
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
  reserved?: boolean
  soldPerUnit?: boolean
  featured?: boolean
  category?: string
  image?: string
  hoverImage?: string
  stoneOrigin?: string
  stoneType?: string
  carats?: number
}

interface ProductCardProps {
  product: ProductCardProduct
  index?: number
  priority?: boolean
}

function metaLine(product: ProductCardProduct): string[] {
  return [
    product.stoneType && storeLabel(product.stoneType),
    product.stoneOrigin && storeLabel(product.stoneOrigin).split(',')[0],
    product.carats ? `${product.carats} ct` : undefined,
  ].filter((value): value is string => Boolean(value))
}

const overlayButton =
  'rounded-sm border border-rule-2 bg-bg text-ink transition-colors hover:border-ink'

export function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const [showQuickView, setShowQuickView] = useState(false)
  const isAvailable = product.stock > 0
  const productHref = `/store/${product.slug}`
  const meta = metaLine(product)
  const discount = savePercent(product.price, product.compareAtPrice)
  const cartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: product.image,
  }

  return (
    <>
      <article className="group relative flex h-full flex-col">
        <div className="relative">
          <ViewTransition name={productImageTransitionName(product.slug)} share="piece" update="none">
            <div className="relative aspect-[4/5] overflow-hidden bg-plinth">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority={priority && index < 4}
                  fetchPriority={priority && index < 2 ? 'high' : undefined}
                  sizes="(max-width: 760px) 50vw, (max-width: 1280px) 25vw, 300px"
                  className="object-cover transition-transform duration-[900ms] ease-gallery group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-ink-3">
                  Photo coming soon
                </div>
              )}
              {product.image && product.hoverImage ? (
                <Image
                  src={product.hoverImage}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 25vw, 300px"
                  className="hidden object-cover opacity-0 transition-opacity duration-500 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:hover)]:block"
                />
              ) : null}
            </div>
          </ViewTransition>

          {isAvailable ? (
            <>
              <div className="absolute inset-x-2 bottom-2 z-10 hidden items-center gap-1.5 opacity-100 transition-opacity duration-300 ease-gallery sm:flex sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 motion-reduce:transition-none">
                <AddToCartButton
                  product={cartProduct}
                  variant="minimal"
                  size="sm"
                  className={`flex-1 justify-center ${overlayButton}`}
                >
                  Quick add
                </AddToCartButton>
                <button
                  type="button"
                  onClick={() => setShowQuickView(true)}
                  title="Quick view"
                  aria-label={`Open quick view for ${product.name}`}
                  className={`flex min-h-[44px] min-w-[44px] items-center justify-center ${overlayButton}`}
                >
                  <Eye size={18} aria-hidden="true" />
                </button>
              </div>
              <AddToCartButton
                product={cartProduct}
                variant="icon"
                size="sm"
                className={`absolute bottom-1.5 right-1.5 z-10 sm:hidden ${overlayButton}`}
              />
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-2.5 gap-y-px px-px pb-0.5 pt-[9px]">
          <h3 className="col-span-2 line-clamp-2 font-serif text-[15px] italic leading-[1.25] text-ink sm:col-span-1">
            <Link href={productHref} className="no-underline after:absolute after:inset-0 after:content-['']">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm font-medium tracking-[0.01em] text-ink">
            {isAvailable ? formatCurrency(product.price, 'AUD') : product.reserved ? 'Reserved' : 'Sold'}
          </p>
          {meta.length > 0 ? (
            <p className="col-span-2 text-xs leading-[1.4] tracking-[0.01em] text-ink-2">{meta.join(' · ')}</p>
          ) : null}
          {isAvailable && discount ? (
            <p className="col-span-2 text-xs text-ink-2">
              <span className="line-through">{formatCurrency(product.compareAtPrice!, 'AUD')}</span>{' '}
              <span className="font-medium text-accent">Save {discount}%</span>
            </p>
          ) : null}
          {isAvailable && product.stock > 1 && product.stock <= 3 ? (
            <p className="col-span-2 text-xs font-medium text-success">Only {product.stock} left</p>
          ) : null}
        </div>
      </article>

      {showQuickView ? (
        <ProductQuickViewModal product={product} isOpen onClose={() => setShowQuickView(false)} />
      ) : null}
    </>
  )
}
