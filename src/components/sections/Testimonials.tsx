import Image from 'next/image'
import { Container, Grid, Section } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import type { Testimonial } from '@/types'

/**
 * Testimonials Section Props
 */
interface TestimonialsSectionProps {
  title?: string
  description?: string
  testimonials: Array<Pick<Testimonial, 'name' | 'role' | 'company' | 'content' | 'avatar' | 'rating'>>
  columns?: 2 | 3
}

/**
 * Testimonials Section Component
 * Display customer testimonials in cards
 */
export function Testimonials({
  title = 'What Our Clients Say',
  description,
  testimonials,
  columns = 3,
}: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null

  return (
    <Section padding="lg">
      <Container>
        <SectionHeader title={title} description={description} />

        {/* Testimonials Grid */}
        <Grid cols={columns} gap="lg">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              {/* Rating */}
              {testimonial.rating && (
                <div className="flex gap-1 mb-4" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating!
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}

              {/* Content */}
              <blockquote className="text-muted-foreground mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                {testimonial.avatar && (
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={testimonial.avatar.url}
                      alt={testimonial.avatar.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  {(testimonial.role || testimonial.company) && (
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                      {testimonial.role && testimonial.company && ', '}
                      {testimonial.company}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
