'use client'

import { useState, ViewTransition, type CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { productImageTransitionName } from '@/lib/view-transitions'

export interface WallPiece {
  slug: string
  name: string
  price: number
  image: string
  kind: string
  stone?: string
  origin?: string
  carats?: number
}

const TILES = [
  { desktop: '1/5/7/11', mobile: '1/1/5/5' },
  { desktop: '1/11/4/14', mobile: '1/5/3/7' },
  { desktop: '1/14/4/17', mobile: '3/5/5/7' },
  { desktop: '5/1/7/3', mobile: '6/1/8/3' },
  { desktop: '5/3/7/5', mobile: '6/3/8/5' },
  { desktop: '4/11/6/13', mobile: '6/5/8/7' },
  { desktop: '4/13/6/15', mobile: '8/1/10/3' },
  { desktop: '4/15/6/17', mobile: '8/3/10/5' },
  { desktop: '6/11/9/14', mobile: '8/5/10/7' },
  { desktop: '6/14/9/17', mobile: '10/1/12/3' },
  { desktop: '7/5/9/7', mobile: '10/3/12/5' },
  { desktop: '7/7/9/9', mobile: '10/5/12/7' },
  { desktop: '7/9/9/11', mobile: '12/1/14/3' },
  { desktop: '7/1/9/3', mobile: '12/3/14/5' },
  { desktop: '7/3/9/5', mobile: '12/5/14/7' },
] as const

const LABEL_MEDIA = '(hover: hover) and (min-width: 1101px)'

function columnSpan(area: string): number {
  const [, start = 0, , end = 0] = area.split('/').map(Number)
  return end - start
}

function tileSizes(desktop: string, mobile: string): string {
  const mobileWidth = Math.ceil((columnSpan(mobile) / 6) * 100)
  const desktopWidth = Math.ceil((columnSpan(desktop) / 16) * 100)
  return `(max-width: 1100px) ${mobileWidth}vw, ${desktopWidth}vw`
}

function PieceLabel({ piece }: { piece: WallPiece }) {
  const rows = [
    ['Stone', piece.stone],
    ['Origin', piece.origin],
    ['Weight', piece.carats ? `${piece.carats} ct` : undefined],
  ].filter((row): row is [string, string] => Boolean(row[1]))

  return (
    <>
      <p className="font-serif text-[clamp(22px,1.9vw,30px)] italic leading-[1.1] tracking-[-0.01em]">
        {piece.name}
      </p>
      {rows.length > 0 ? (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-[5px] text-[13.5px]">
          {rows.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="text-ink-3">{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="mt-auto flex items-baseline justify-between gap-3 border-t border-rule pt-3 text-xl font-medium">
        <span className="text-[13px] font-normal text-ink-2">{piece.kind}</span>
        {formatCurrency(piece.price)}
      </p>
    </>
  )
}

export function LivingWall({ pieces }: { pieces: WallPiece[] }) {
  const [labelled, setLabelled] = useState<WallPiece | null>(null)
  const [showing, setShowing] = useState(false)

  const show = (piece: WallPiece) => {
    if (!window.matchMedia(LABEL_MEDIA).matches) return
    setLabelled(piece)
    setShowing(true)
  }
  const hide = () => setShowing(false)

  return (
    <section
      aria-label="Pieces on the wall"
      onPointerLeave={hide}
      className="grid grid-cols-6 gap-1.5 px-gut pt-1.5 [--row:calc((100vw_-_2*clamp(12px,2vw,28px)_-_30px)/6*1.2)] [grid-auto-rows:var(--row)] [grid-template-rows:repeat(4,var(--row))_auto] min-[761px]:[--row:calc((100vw_-_2*clamp(12px,2vw,28px)_-_30px)/6*0.9)] min-[1101px]:h-[calc(100svh-56px)] min-[1101px]:[body:has([data-promo-bar])_&]:h-[calc(100svh-90px)] min-[1101px]:max-h-[1000px] min-[1101px]:min-h-[600px] min-[1101px]:gap-2 min-[1101px]:pt-2 min-[1101px]:[grid-template-columns:repeat(16,minmax(0,1fr))] min-[1101px]:[grid-template-rows:repeat(8,minmax(0,1fr))]"
    >
      <div className="my-1.5 grid border border-rule px-4 py-[18px] [grid-area:5/1/6/-1] min-[1101px]:my-0 min-[1101px]:p-[clamp(16px,1.6vw,26px)] min-[1101px]:[grid-area:1/1/5/5]">
        <div
          className={`flex min-h-0 flex-col transition-[opacity,transform] duration-300 ease-gallery [grid-area:1/1] motion-reduce:transition-none ${showing ? '-translate-y-1.5 opacity-0' : ''}`}
        >
          <h1 className="text-[30px] leading-[1.04] min-[1101px]:max-w-[11ch] min-[1101px]:text-[clamp(28px,2.6vw,42px)]">
            Australian opals, <i>chosen by hand.</i>
          </h1>
          <p className="mt-2 max-w-[34ch] text-sm leading-normal text-ink-2 min-[1101px]:mt-3.5 min-[1101px]:text-[14.5px]">
            One-of-a-kind stones and jewellery, sourced here and explained clearly.
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-4 min-[1101px]:mt-auto">
            <Button asChild>
              <Link href="/store">
                Enter the shop
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <span className="hidden text-[12.5px] text-ink-3 min-[1101px]:[@media(hover:hover)]:inline">
              Point at a piece to read its label
            </span>
          </div>
        </div>
        <div
          aria-hidden="true"
          className={`pointer-events-none hidden min-h-0 flex-col transition-[opacity,transform] duration-300 ease-gallery [grid-area:1/1] motion-reduce:transition-none min-[1101px]:flex ${showing ? 'opacity-100' : 'translate-y-1.5 opacity-0'}`}
        >
          {labelled ? <PieceLabel piece={labelled} /> : null}
        </div>
      </div>

      {TILES.map((tile, index) => {
        const piece = pieces[index]
        if (!piece) return null
        return (
          <Link
            key={piece.slug}
            href={`/store/${piece.slug}`}
            aria-label={`${piece.name}, ${formatCurrency(piece.price)}`}
            onPointerEnter={() => show(piece)}
            onFocus={() => show(piece)}
            onBlur={hide}
            style={{ '--desktop': tile.desktop, '--mobile': tile.mobile } as CSSProperties}
            className={`group relative block overflow-hidden bg-plinth [grid-area:var(--mobile)] min-[1101px]:[grid-area:var(--desktop)] ${index >= 9 ? 'max-[760px]:hidden' : ''}`}
          >
            <ViewTransition name={productImageTransitionName(piece.slug)} share="piece" update="none">
              <div className="absolute inset-0">
                <Image
                  src={piece.image}
                  alt=""
                  fill
                  priority={index === 0}
                  fetchPriority={index === 0 ? 'high' : undefined}
                  sizes={tileSizes(tile.desktop, tile.mobile)}
                  className="object-cover transition-transform duration-[1100ms] ease-gallery group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            </ViewTransition>
          </Link>
        )
      })}
    </section>
  )
}
