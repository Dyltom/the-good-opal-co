import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, BookOpen, Gem, Hammer } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { CourseInterestPanel } from '@/components/education'
import { CourseListJsonLd } from '@/components/seo'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { courseFormatLabels, courseLevelLabels } from '@/lib/courses'
import type { Course, Media } from '@/types/payload-types'

export const metadata: Metadata = {
  title: 'Opal cutting courses | The Good Opal Co',
  description:
    "Explore Steph's public outline for Australian opal anatomy, cutting, polishing, and valuation.",
  alternates: { canonical: '/courses' },
}

export const dynamic = 'force-dynamic'

function populatedMedia(value?: number | null | Media): Media | null {
  return value && typeof value === 'object' ? value : null
}

export default async function CoursesPage() {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'courses',
    where: { status: { equals: 'published' } },
    limit: 12,
    sort: '-publishedAt',
    depth: 1,
  })
  const courses = docs as Course[]

  return (
    <MarketingShell>
      {courses.length > 0 ? (
        <CourseListJsonLd
          courses={courses.map((course) => ({
            name: course.title,
            slug: course.slug,
            description: course.summary,
          }))}
        />
      ) : null}
      <section className="overflow-hidden border-b border-warm-grey/60 bg-cream">
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-24">
          <div className="relative z-10">
            <p className="font-sans text-sm font-semibold text-opal-electric-accessible">
              Opal education
            </p>
            <h1 className="mt-5 max-w-[10ch] text-balance font-serif text-[clamp(3.5rem,7vw,7rem)] font-medium leading-[0.9]">
              Learn what the stone can become.
            </h1>
            <p className="mt-7 max-w-[62ch] font-sans text-base leading-7 text-charcoal/70 sm:text-lg sm:leading-8">
              Steph&apos;s course starts with opal anatomy, then moves through low-cost hand
              cutting, rotary tools, cabbing machines, polishing, and valuation.
            </p>
          </div>
          <div
            className="grid grid-cols-[0.88fr_1.12fr] gap-3 sm:gap-5"
            aria-label="Australian opals prepared for cutting"
          >
            <div className="relative mt-12 aspect-[4/5] overflow-hidden bg-charcoal">
              <Image
                src="/images/customs/custom-1.jpg"
                alt="Three pale Australian opals cut into heart shapes"
                fill
                priority
                sizes="(max-width: 1024px) 44vw, 22vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[4/5] overflow-hidden bg-charcoal">
              <Image
                src="/images/customs/custom-3.jpg"
                alt="Six bright Australian opals showing varied shapes and colour"
                fill
                priority
                sizes="(max-width: 1024px) 56vw, 28vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-24">
        <div className="grid gap-8 border-y border-warm-grey/70 py-8 sm:grid-cols-3">
          {[
            {
              icon: Gem,
              title: 'Understand the rough',
              body: 'Colour bars, potch, host rock, origin, and opal types.',
            },
            {
              icon: Hammer,
              title: 'Choose a cutting method',
              body: 'Sandpaper, rotary tool, and cabbing-machine pathways.',
            },
            {
              icon: BookOpen,
              title: 'Build valuation judgment',
              body: 'Brightness, pattern, weight, inclusions, and market factors.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <Icon
                className="mt-1 h-5 w-5 shrink-0 text-opal-electric-accessible"
                aria-hidden="true"
              />
              <div>
                <h2 className="font-serif text-xl font-medium">{title}</h2>
                <p className="mt-2 font-sans text-sm leading-6 text-charcoal/65">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {courses.length > 0 ? (
          <div className="mt-20 space-y-20">
            {courses.map((course, index) => {
              const image = populatedMedia(course.featuredImage)
              const imageUrl = resolveMediaUrl(image?.url)
              return (
                <article
                  key={course.id}
                  className="grid gap-9 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-14"
                >
                  <Link
                    href={`/courses/${course.slug}`}
                    className="group relative aspect-[16/11] overflow-hidden bg-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                  >
                    <Image
                      src={
                        imageUrl ??
                        (index % 2 === 0
                          ? '/images/customs/custom-2.jpg'
                          : '/images/customs/custom-3.jpg')
                      }
                      alt={image?.alt || 'Australian opals selected for cutting practice'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 56vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    />
                  </Link>
                  <div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 font-sans text-xs uppercase tracking-[0.1em] text-charcoal/50">
                      <span>{courseFormatLabels[course.format]}</span>
                      <span>{courseLevelLabels[course.level]}</span>
                      {course.duration ? <span>{course.duration}</span> : null}
                    </div>
                    <h2 className="mt-5 text-balance font-serif text-4xl font-medium leading-tight sm:text-5xl">
                      <Link
                        href={`/courses/${course.slug}`}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                      >
                        {course.title}
                      </Link>
                    </h2>
                    <p className="mt-5 max-w-xl font-sans text-base leading-7 text-charcoal/70">
                      {course.summary}
                    </p>
                    <p className="mt-6 font-sans text-sm text-charcoal/60">
                      Taught by {course.instructor.name}
                    </p>
                    <Link
                      href={`/courses/${course.slug}`}
                      className="mt-8 inline-flex min-h-11 items-center gap-2 border-b border-charcoal pb-1 font-sans text-sm font-semibold"
                    >
                      Explore the public outline{' '}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <div className="mt-10 max-w-md">
                      <CourseInterestPanel course={course} />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-20 border-y border-warm-grey/70 py-14">
            <h2 className="font-serif text-3xl font-medium">Course details are being reviewed.</h2>
            <p className="mt-3 max-w-xl font-sans text-sm leading-6 text-charcoal/65">
              The free opal guides remain available while the next course outline, format, and
              timing are confirmed.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 border-b border-charcoal pb-1 font-sans text-sm font-semibold"
            >
              Read free opal guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        )}
      </Container>
    </MarketingShell>
  )
}
