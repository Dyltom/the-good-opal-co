import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft, Check, UserRound } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { CourseCurriculum, CourseInterestPanel } from '@/components/education'
import { APP_NAME, APP_URL } from '@/lib/constants'
import { courseFormatLabels, courseLevelLabels } from '@/lib/courses'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import type { Course, Media } from '@/types/payload-types'

export const dynamic = 'force-dynamic'

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

const getPublishedCourse = cache(async (slug: string): Promise<Course | undefined> => {
  const payload = await getPayload()
  const { docs } = await payload.find({
    collection: 'courses',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }] },
    limit: 1,
    depth: 2,
  })
  return docs[0] as Course | undefined
})

function mediaObject(value?: number | null | Media): Media | null {
  return value && typeof value === 'object' ? value : null
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getPublishedCourse(slug)
  if (!course)
    return { title: `Course not found | ${APP_NAME}`, robots: { index: false, follow: false } }

  const title = course.meta?.title?.trim() || `${course.title} | ${APP_NAME}`
  const description = course.meta?.description?.trim() || course.summary
  const image = mediaObject(course.meta?.image) || mediaObject(course.featuredImage)
  const imageUrl = resolveMediaUrl(image?.url)
  const canonical = new URL(`/courses/${encodeURIComponent(course.slug)}`, APP_URL).toString()
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      siteName: APP_NAME,
      images: imageUrl ? [{ url: imageUrl, alt: image?.alt || course.title }] : undefined,
    },
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const course = await getPublishedCourse(slug)
  if (!course) notFound()
  const featured = mediaObject(course.featuredImage)
  const imageUrl = resolveMediaUrl(featured?.url)

  return (
    <MarketingShell>
      <Container className="py-10 sm:py-14">
        <Link
          href="/courses"
          className="inline-flex min-h-11 items-center gap-2 border-b border-charcoal pb-1 font-sans text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All courses
        </Link>
      </Container>

      <section className="border-y border-warm-grey/60 bg-cream">
        <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
          <div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 font-sans text-xs uppercase tracking-[0.1em] text-charcoal/50">
              <span>{courseFormatLabels[course.format]}</span>
              <span>{courseLevelLabels[course.level]}</span>
              {course.duration ? <span>{course.duration}</span> : null}
            </div>
            <h1 className="mt-5 max-w-[13ch] text-balance font-serif text-[clamp(3rem,6vw,6.3rem)] font-medium leading-[0.94]">
              {course.title}
            </h1>
            <p className="mt-7 max-w-2xl font-sans text-base leading-7 text-charcoal/70 sm:text-lg sm:leading-8">
              {course.summary}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
            <Image
              src={imageUrl ?? '/images/customs/custom-2.jpg'}
              alt={featured?.alt || 'Four Australian opals showing varied colour and pattern'}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-20">
          <div>
            <p className="font-sans text-sm font-semibold text-opal-electric-accessible">
              Course overview
            </p>
            <p className="mt-5 max-w-[68ch] whitespace-pre-line font-sans text-base leading-8 text-charcoal/75">
              {course.introduction}
            </p>

            {course.outcomes?.length ? (
              <section className="mt-14" aria-labelledby="outcomes-heading">
                <h2 id="outcomes-heading" className="font-serif text-3xl font-medium sm:text-4xl">
                  What you will learn
                </h2>
                <ul className="mt-7 grid gap-4 sm:grid-cols-2">
                  {course.outcomes.map(({ item, id }) => (
                    <li
                      key={id ?? item}
                      className="flex gap-3 font-sans text-sm leading-6 text-charcoal/75"
                    >
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-opal-emerald-dark"
                        aria-hidden="true"
                      />{' '}
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-16" aria-labelledby="curriculum-heading">
              <p className="font-sans text-sm font-semibold text-opal-electric-accessible">
                Public outline
              </p>
              <h2
                id="curriculum-heading"
                className="mt-3 font-serif text-4xl font-medium sm:text-5xl"
              >
                Course curriculum
              </h2>
              <p className="mt-4 max-w-2xl font-sans text-sm leading-6 text-charcoal/65">
                The outline shows the subjects covered. Lesson materials remain account-gated.
              </p>
              <div className="mt-8">
                <CourseCurriculum modules={course.curriculum} />
              </div>
            </section>

            <section
              className="mt-16 border-y border-warm-grey/70 py-10"
              aria-labelledby="instructor-heading"
            >
              <div className="flex gap-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-charcoal text-cream">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.12em] text-charcoal/50">
                    Instructor
                  </p>
                  <h2 id="instructor-heading" className="mt-2 font-serif text-3xl font-medium">
                    {course.instructor.name}
                  </h2>
                  {course.instructor.role ? (
                    <p className="mt-1 font-sans text-sm text-charcoal/60">
                      {course.instructor.role}
                    </p>
                  ) : null}
                  {course.instructor.bio ? (
                    <p className="mt-5 max-w-2xl font-sans text-sm leading-7 text-charcoal/70">
                      {course.instructor.bio}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            {course.audience?.length ? (
              <section className="mt-14" aria-labelledby="audience-heading">
                <h2 id="audience-heading" className="font-serif text-3xl font-medium">
                  Who this is for
                </h2>
                <ul className="mt-6 space-y-3 font-sans text-sm leading-6 text-charcoal/70">
                  {course.audience.map(({ item, id }) => (
                    <li key={id ?? item}>• {item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
          <div className="lg:sticky lg:top-28">
            <CourseInterestPanel course={course} />
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
