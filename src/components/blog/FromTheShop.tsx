import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Where } from 'payload'
import { ProductCard } from '@/components/product/ProductCard'
import { toProductCardProduct } from '@/components/product/RelatedProducts'
import { facetOptionLabel, parseStoreQuery, storeUrl } from '@/app/(marketing)/store/store-query'
import { LISTED_PRODUCTS } from '@/lib/catalog-visibility'
import { getPayload } from '@/lib/payload'
import { cn, formatCurrency } from '@/lib/utils'
import type { Post, Product } from '@/types/payload-types'

type ShopFilter = { origin: string } | { stone: string } | { category: string }

const SHOP_FILTERS: [RegExp, ShopFilter][] = [
  [/coober[\s-]pedy/, { origin: 'coober-pedy' }],
  [/lightning[\s-]ridge/, { origin: 'lightning-ridge' }],
  [/andamooka/, { origin: 'andamooka' }],
  [/mintabie/, { origin: 'mintabie' }],
  [/boulder|queensland/, { stone: 'boulder-opal' }],
  [/\bcut|cabbing|jewellery[\s-]making/, { category: 'raw-opals' }],
  [/jewel|\brings?\b/, { category: 'opal-rings' }],
]

function shopFilterFor(post: Post): ShopFilter | undefined {
  const text = `${post.slug} ${post.title}`.toLocaleLowerCase('en-AU')
  return SHOP_FILTERS.find(([pattern]) => pattern.test(text))?.[1]
}

function filterWhere(filter: ShopFilter): Where {
  if ('origin' in filter) return { stoneOrigin: { equals: filter.origin } }
  if ('stone' in filter) return { stoneType: { equals: filter.stone } }
  return { category: { equals: filter.category } }
}

function filterLabel(filter: ShopFilter): string {
  if ('origin' in filter)
    return `Shop ${facetOptionLabel('origin', filter.origin).split(',')[0]} opal`
  if ('stone' in filter)
    return `Shop ${facetOptionLabel('stone', filter.stone).toLocaleLowerCase('en-AU')}`
  return `Shop ${facetOptionLabel('category', filter.category).toLocaleLowerCase('en-AU')}`
}

async function inStock(
  scope: Where[],
  exclude: Product['id'][],
  limit: number
): Promise<Product[]> {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      and: [...scope, LISTED_PRODUCTS, { stock: { greater_than: 0 } }, { id: { not_in: exclude } }],
    },
    limit,
    sort: '-createdAt',
    depth: 2,
  })
  return docs
}

export interface ShopPicks {
  products: Product[]
  link: { href: string; label: string }
}

export async function shopPicks(post: Post): Promise<ShopPicks | null> {
  const filter = shopFilterFor(post)
  const matched = filter ? await inStock([filterWhere(filter)], [], 3) : []
  const products = [
    ...matched,
    ...(matched.length < 3
      ? await inStock(
          [],
          matched.map((product) => product.id),
          3 - matched.length
        )
      : []),
  ]

  if (products.length === 0) return null

  const link =
    filter && matched.length > 0
      ? { href: storeUrl(parseStoreQuery(filter)), label: filterLabel(filter) }
      : { href: '/store', label: 'All pieces' }
  return { products, link }
}

export function FromTheShop({ picks, className }: { picks: ShopPicks; className?: string }) {
  return (
    <section
      aria-labelledby="from-the-shop"
      className={cn('border-t border-rule pt-10', className)}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="from-the-shop"
          className="text-[clamp(26px,3vw,38px)] leading-[1.05] tracking-[-0.015em]"
        >
          From the shop
        </h2>
        <Link
          href={picks.link.href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-sm font-medium text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
        >
          {picks.link.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-x-2.5 gap-y-7 md:grid-cols-3 md:gap-x-4 max-md:[&>article:nth-of-type(3)]:hidden">
        {picks.products.map((product, index) => (
          <ProductCard key={product.id} product={toProductCardProduct(product)} index={index} />
        ))}
      </div>
    </section>
  )
}

export function ShopPicksList({ picks }: { picks: ShopPicks }) {
  return (
    <section aria-labelledby="shop-picks">
      <h2 id="shop-picks" className="text-xs font-medium uppercase tracking-[0.06em] text-ink-3">
        From the shop
      </h2>
      <ul className="mt-3 space-y-3">
        {picks.products.map((product) => {
          const card = toProductCardProduct(product)
          return (
            <li key={product.id}>
              <Link href={`/store/${product.slug}`} className="group flex items-center gap-3">
                <span className="relative h-[72px] w-[58px] shrink-0 overflow-hidden bg-plinth">
                  {card.image ? (
                    <Image src={card.image} alt="" fill sizes="58px" className="object-cover" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block font-serif text-[15px] italic leading-snug text-ink group-hover:underline group-hover:decoration-rule-2 group-hover:underline-offset-4">
                    {product.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-2">
                    {formatCurrency(product.price, 'AUD')}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <Link
        href={picks.link.href}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-ink underline decoration-rule-2 underline-offset-4 hover:decoration-ink"
      >
        {picks.link.label}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  )
}
