import Link from 'next/link'
import { connection } from 'next/server'
import { announcement, promotionsPending } from '@/lib/promotions'

export async function PromoBar() {
  if (!promotionsPending()) return null
  await connection()
  const promo = announcement()
  if (!promo) return null

  return (
    <Link
      href={promo.href}
      data-promo-bar
      className="group block bg-ink px-gut py-2 text-center text-[12.5px] leading-[1.4] tracking-[0.01em] text-bg no-underline"
    >
      <span className="sm:hidden">{promo.short}</span>
      <span className="max-sm:hidden">{promo.text}</span>
      <span aria-hidden="true" className="sm:hidden"> →</span>
      <span className="max-sm:hidden">
        {' · '}
        <span className="underline decoration-bg/40 underline-offset-[3px] group-hover:decoration-bg">{promo.action}</span>
      </span>
    </Link>
  )
}
