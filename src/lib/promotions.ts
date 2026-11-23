export interface Sale {
  name: string
  percentOff: number
  startsAt: Date
  endsAt: Date
  dates: string
  lastDay: string
}

export interface Announcement {
  text: string
  short: string
  href: string
  action: string
}

const sydneyMidnight = (date: string) => new Date(`${date}T00:00:00+11:00`)

export const SALES: readonly Sale[] = [
  {
    name: 'Black Friday',
    percentOff: 15,
    startsAt: sydneyMidnight('2026-11-27'),
    endsAt: sydneyMidnight('2026-12-01'),
    dates: 'Fri 27 to Mon 30 Nov',
    lastDay: 'Mon 30 Nov',
  },
]

export const CHRISTMAS_DELIVERY = {
  orderBy: 'Thu 17 Dec',
  remoteOrderBy: 'Thu 10 Dec',
  endsAt: sydneyMidnight('2026-12-18'),
} as const

const promotionsEnd = Math.max(CHRISTMAS_DELIVERY.endsAt.getTime(), ...SALES.map((sale) => sale.endsAt.getTime()))

export function promotionsPending(now = new Date()): boolean {
  return now.getTime() < promotionsEnd
}

export function activeSale(now = new Date()): Sale | undefined {
  return SALES.find((sale) => now >= sale.startsAt && now < sale.endsAt)
}

export function nextSale(now = new Date()): Sale | undefined {
  return SALES.find((sale) => now < sale.endsAt)
}

export function saleApplies(category: string): boolean {
  return category !== 'custom-commissions'
}

export function salePrice(price: number, sale: Sale): number {
  return Math.round(price * (100 - sale.percentOff)) / 100
}

export function saleLastDay(sale: Sale): string {
  return new Date(sale.endsAt.getTime() - 1).toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })
}

interface Priced {
  price: number
  category: string
  compareAtPrice?: number | null
}

export function withSalePrice<T extends Priced>(product: T, now = new Date()): T {
  const sale = activeSale(now)
  if (!sale || !saleApplies(product.category)) return product
  return { ...product, price: salePrice(product.price, sale), compareAtPrice: product.price }
}

export function announcement(now = new Date()): Announcement | undefined {
  const sale = nextSale(now)
  if (sale) {
    const live = now >= sale.startsAt
    return {
      text: `${sale.name}: ${sale.percentOff}% off all opals and jewellery, ${live ? `until ${sale.lastDay}` : sale.dates}`,
      short: `${sale.name}: ${sale.percentOff}% off, ${live ? `until ${sale.lastDay}` : sale.dates}`,
      href: '/store',
      action: live ? 'Shop the sale' : 'Browse now',
    }
  }
  if (now < CHRISTMAS_DELIVERY.endsAt) {
    return {
      text: `Order by ${CHRISTMAS_DELIVERY.orderBy} for Christmas delivery in Australia`,
      short: `Order by ${CHRISTMAS_DELIVERY.orderBy} for Christmas delivery`,
      href: '/gifts',
      action: 'Gift ideas',
    }
  }
  return undefined
}
