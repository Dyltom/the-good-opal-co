import { Star } from 'lucide-react'
import type { Where } from 'payload'
import { getPayload } from '@/lib/payload'
import { cn } from '@/lib/utils'

interface ReviewsSectionProps {
  productId?: number
  eyebrow?: string
  title: string
  className?: string
}

const reviewDate = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Australia/Sydney',
})

export async function ReviewsSection({ productId, eyebrow, title, className }: ReviewsSectionProps) {
  const payload = await getPayload()
  const published: Where = { status: { equals: 'published' } }
  const { docs: reviews } = await payload.find({
    collection: 'reviews',
    where: productId ? { and: [published, { product: { equals: productId } }] } : published,
    sort: '-reviewedAt',
    limit: 6,
    depth: 0,
  })

  if (reviews.length === 0) return null

  return (
    <section aria-labelledby="customer-reviews" className={className}>
      {eyebrow ? (
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      ) : null}
      <h2 id="customer-reviews" className="mt-4 font-serif text-3xl font-medium text-ink sm:text-4xl">
        {title}
      </h2>
      <ul className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => {
          const rating = typeof review.rating === 'number' ? Math.round(review.rating) : null
          return (
            <li key={review.id} className="border-t border-rule pt-6">
              <figure className="flex h-full flex-col">
                {rating ? (
                  <p className="flex gap-0.5 text-ink" aria-label={`Rated ${rating} out of 5`}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <Star
                        key={step}
                        className={cn('h-4 w-4', step <= rating ? 'fill-current' : 'text-ink-3')}
                        aria-hidden="true"
                      />
                    ))}
                  </p>
                ) : null}
                <blockquote className={cn('flex-1 font-serif text-xl leading-8 text-ink', rating && 'mt-4')}>
                  <p className="whitespace-pre-line">{review.body}</p>
                </blockquote>
                <figcaption className="mt-6 font-sans text-sm leading-6 text-ink-2">
                  <span className="font-semibold text-ink">{review.authorName}</span>
                  <span aria-hidden="true"> · </span>
                  <time dateTime={review.reviewedAt}>{reviewDate.format(new Date(review.reviewedAt))}</time>
                  <span aria-hidden="true"> · </span>
                  {review.sourceUrl ? (
                    <a
                      href={review.sourceUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="underline decoration-ink-3 underline-offset-4 hover:decoration-ink"
                    >
                      via {review.source}
                    </a>
                  ) : (
                    <span>via {review.source}</span>
                  )}
                </figcaption>
              </figure>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
