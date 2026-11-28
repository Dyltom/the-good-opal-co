import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { CourseCurriculum, CourseInterestPanel } from '@/components/education'
import { BreadcrumbJsonLd, CourseJsonLd } from '@/components/seo'
import { getPageContent } from '@/lib/site-content'
import { APP_NAME, APP_URL, SHARE_IMAGE_URL } from '@/lib/constants'
import { courseFormatLabels, courseLevelLabels, courseOutlineStats } from '@/lib/courses'
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
  const imageUrl = resolveMediaUrl(image?.url) || SHARE_IMAGE_URL
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
      images: [{ url: imageUrl, alt: image?.alt || course.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const [course, content] = await Promise.all([getPublishedCourse(slug), getPageContent('courses')])
  if (!course) notFound()
  const featured = mediaObject(course.featuredImage)
  const imageUrl = resolveMediaUrl(featured?.url)
  const outlineStats = courseOutlineStats(course.curriculum)

  return (
    <MarketingShell>
      <CourseJsonLd
        course={{
          name: course.title,
          slug: course.slug,
          description: course.summary,
          instructor: course.instructor.name,
          image: imageUrl ?? undefined,
          level: courseLevelLabels[course.level],
          format: courseFormatLabels[course.format],
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Courses', url: '/courses' },
          { name: course.title, url: `/courses/${course.slug}` },
        ]}
      />
      <Container className="pb-sec">
        <Link
          href="/courses"
          className="mt-[18px] inline-flex min-h-11 items-center gap-2 text-sm text-ink-2 transition-colors hover:text-ink md:mt-5"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All courses
        </Link>

        <header className="mt-3 grid items-center gap-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)]">
          <div>
            <p className="flex flex-wrap gap-x-2 text-[13px] text-ink-3">
              <span>{courseFormatLabels[course.format]}</span>
              <span aria-hidden="true">&middot;</span>
              <span>{courseLevelLabels[course.level]}</span>
              {course.duration ? (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{course.duration}</span>
                </>
              ) : null}
              {outlineStats.lessons > 0 ? (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <span>{outlineStats.lessons} lesson groups</span>
                </>
              ) : null}
            </p>
            <h1 className="mt-3 max-w-[13ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              {course.title}
            </h1>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              {course.summary}
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(260px,27vw,400px)]">
            <Image
              src={imageUrl ?? content.detailImage.src}
              alt={featured?.alt || content.detailImage.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
        </header>

        <div className="mt-14 grid gap-12 md:mt-[clamp(48px,5.5vw,84px)] lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-[clamp(32px,4vw,72px)]">
          <div>
            <p className="max-w-[65ch] whitespace-pre-line text-base leading-[1.7] text-ink">
              {course.introduction}
            </p>

            {course.outcomes?.length ? (
              <section className="mt-12" aria-labelledby="outcomes-heading">
                <h2 id="outcomes-heading">What you will learn</h2>
                <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {course.outcomes.map(({ item, id }) => (
                    <li key={id ?? item} className="flex gap-3 text-sm leading-6 text-ink">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-12" aria-labelledby="curriculum-heading">
              <h2 id="curriculum-heading">Course outline</h2>
              <p className="mt-2 max-w-[65ch] text-sm leading-6 text-ink-2">
                This public outline shows the planned subjects. It does not include lessons or
                promise a start date.
              </p>
              <div className="mt-6">
                <CourseCurriculum modules={course.curriculum} />
              </div>
            </section>

            <section
              className="mt-12 border-t border-rule pt-8"
              aria-labelledby="instructor-heading"
            >
              <h2 id="instructor-heading">{course.instructor.name}</h2>
              {course.instructor.role ? (
                <p className="mt-1 text-sm text-ink-2">{course.instructor.role}</p>
              ) : null}
              {course.instructor.bio ? (
                <p className="mt-4 max-w-[65ch] text-sm leading-7 text-ink-2">
                  {course.instructor.bio}
                </p>
              ) : null}
            </section>

            {course.audience?.length ? (
              <section className="mt-12" aria-labelledby="audience-heading">
                <h2 id="audience-heading">Who this is for</h2>
                <ul className="mt-4 max-w-[65ch] list-disc space-y-2 pl-5 text-sm leading-6 text-ink-2 marker:text-ink-3">
                  {course.audience.map(({ item, id }) => (
                    <li key={id ?? item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
          <div className="max-lg:order-first lg:sticky lg:top-[calc(theme(spacing.mast)+24px)]">
            <CourseInterestPanel course={course} />
          </div>
        </div>
      </Container>
    </MarketingShell>
  )
}
