import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

export interface ClosingBandProps {
  id: string
  heading: ReactNode
  line: string
  image: { src: string; alt: string; position?: string }
  action: { href: string; label: string }
  links?: { href: string; label: string }[]
}

export function ClosingBand({ id, heading, line, image, action, links }: ClosingBandProps) {
  return (
    <section aria-labelledby={id} className="closing-band mt-sec bg-plinth text-ink">
      <div className="grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-center">
        <div className="order-2 px-gut pb-12 pt-9 md:order-1 md:py-sec">
          <h2
            id={id}
            className="max-w-[13ch] text-[clamp(2rem,3.6vw,3.5rem)] leading-[1.02] tracking-[-0.02em]"
          >
            {heading}
          </h2>
          <p className="mt-4 max-w-[40ch] text-base leading-[1.6] text-ink-2">{line}</p>
          <Button asChild className="mt-7">
            <Link href={action.href}>
              {action.label}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          {links?.length ? (
            <p className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink hover:decoration-ink"
                >
                  {link.label}
                </Link>
              ))}
            </p>
          ) : null}
        </div>
        <div className="relative order-1 aspect-[5/4] md:order-2 md:aspect-auto md:h-[min(82vh,760px)]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 767px) 100vw, 60vw"
            className="object-cover"
            style={image.position ? { objectPosition: image.position } : undefined}
          />
        </div>
      </div>
    </section>
  )
}
