import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/layout'
import { EditableHeading, MarketingShell } from '@/components/marketing'
import { CourseInterestPanel } from '@/components/education'
import { CourseListJsonLd } from '@/components/seo'
import { getPayload } from '@/lib/payload'
import { resolveMediaUrl } from '@/lib/media-url'
import { getPageContent } from '@/lib/site-content'
import { courseFormatLabels, courseLevelLabels } from '@/lib/courses'
import type { Course, Media } from '@/types/payload-types'
import { Button } from '@/components/ui/button'

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
  const content = await getPageContent('courses')

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
      <Container className="pb-sec">
        <header className="grid items-center gap-[18px] pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <div>
            <h1 className="max-w-[12ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              <EditableHeading heading={content.heroHeading} />
            </h1>
            <p className="mt-3 max-w-[52ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              {content.heroText}
            </p>
          </div>
          <ul
            aria-label="Australian opals prepared for cutting"
            className="grid grid-cols-2 items-end gap-1.5 md:gap-2"
          >
            <li className="relative aspect-[4/5] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(220px,22vw,340px)]">
              <Image
                src={content.heroImage1.src}
                alt={content.heroImage1.alt}
                fill
                priority
                sizes="(max-width: 768px) 48vw, 26vw"
                className="object-cover"
              />
            </li>
            <li className="relative aspect-[4/5] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(240px,25vw,380px)]">
              <Image
                src={content.heroImage2.src}
                alt={content.heroImage2.alt}
                fill
                sizes="(max-width: 768px) 48vw, 26vw"
                className="object-cover"
              />
            </li>
          </ul>
        </header>

        <ul className="mt-10 grid border-t border-rule md:mt-14 md:grid-cols-3 md:border-b">
          {content.pillars.map(({ title, body }) => (
            <li
              key={title}
              className="border-b border-rule py-5 md:border-b-0 md:px-6 md:pb-[26px] md:pt-[22px] md:first:pl-0 md:[&:not(:first-child)]:border-l"
            >
              <h2 className="text-[1.375rem]">{title}</h2>
              <p className="mt-2 text-sm leading-[1.6] text-ink-2">{body}</p>
            </li>
          ))}
        </ul>

        {courses.length > 0 ? (
          <div className="mt-14 space-y-14 md:mt-[clamp(48px,5.5vw,84px)] md:space-y-[clamp(48px,5.5vw,84px)]">
            {courses.map((course, index) => {
              const image = populatedMedia(course.featuredImage)
              const imageUrl = resolveMediaUrl(image?.url)
              const fallback = index % 2 === 0 ? content.courseImage1 : content.courseImage2
              return (
                <article
                  key={course.id}
                  className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start md:gap-[clamp(20px,4vw,72px)]"
                >
                  <Link
                    href={`/courses/${course.slug}`}
                    className="group relative aspect-[4/3] overflow-hidden bg-plinth"
                  >
                    <Image
                      src={imageUrl ?? fallback.src}
                      alt={imageUrl ? image?.alt || fallback.alt : fallback.alt}
                      fill
                      loading={index === 0 ? 'eager' : undefined}
                      sizes="(max-width: 768px) 100vw, 52vw"
                      className="object-cover transition-transform duration-700 ease-gallery group-hover:scale-[1.02]"
                    />
                  </Link>
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
                    </p>
                    <h2 className="mt-3 text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]">
                      <Link href={`/courses/${course.slug}`}>{course.title}</Link>
                    </h2>
                    <p className="mt-4 max-w-[60ch] text-base leading-[1.65] text-ink-2">
                      {course.summary}
                    </p>
                    <p className="mt-3 text-sm text-ink-2">Taught by {course.instructor.name}</p>
                    <Button asChild variant="ghost" className="mt-6">
                      <Link href={`/courses/${course.slug}`}>
                        Explore the public outline <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                    <div className="mt-8 max-w-md">
                      <CourseInterestPanel course={course} />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="mt-14 grid gap-4 md:mt-[clamp(48px,5.5vw,84px)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(20px,4vw,72px)]">
            <h2 className="text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]">
              Course details are being reviewed.
            </h2>
            <div className="max-w-[60ch]">
              <p className="text-base leading-[1.65] text-ink-2">
                The free opal guides remain available while the next course outline, format, and
                timing are confirmed.
              </p>
              <Button asChild variant="ghost" className="mt-5">
                <Link href="/blog">
                  Read free opal guides <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </Container>
    </MarketingShell>
  )
}
