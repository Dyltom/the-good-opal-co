import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import type { Course } from '@/types/payload-types'
import { courseInterestHref } from '@/lib/courses'

interface CourseInterestPanelProps {
  course: Pick<Course, 'title' | 'availability'>
}

export function CourseInterestPanel({ course }: CourseInterestPanelProps) {
  if (course.availability === 'closed') {
    return (
      <aside className="bg-charcoal p-7 text-cream sm:p-9" aria-label="Course availability">
        <p className="font-sans text-xs uppercase tracking-[0.14em] text-cream/55">Availability</p>
        <h2 className="mt-3 font-serif text-3xl font-medium">Interest is currently closed.</h2>
        <p className="mt-4 font-sans text-sm leading-6 text-cream/70">
          Explore the free cutting guides while the next course decision is made.
        </p>
        <Link
          href="/blog"
          className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-cream/60 font-sans text-sm font-semibold"
        >
          Read free guides <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    )
  }

  return (
    <aside className="bg-charcoal p-7 text-cream sm:p-9" aria-label="Register course interest">
      <Mail className="h-6 w-6 text-opal-light" aria-hidden="true" />
      <p className="mt-6 font-sans text-xs uppercase tracking-[0.14em] text-cream/55">
        {course.availability === 'coming-soon' ? 'Coming soon' : 'Register interest'}
      </p>
      <h2 className="mt-3 text-balance font-serif text-3xl font-medium leading-tight">
        Be first to hear when access is confirmed.
      </h2>
      <p className="mt-4 font-sans text-sm leading-6 text-cream/70">
        No payment is taken. Send your experience level and what you want to learn, then we will
        reply with confirmed details.
      </p>
      <Link
        href={courseInterestHref(course.title)}
        className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cream px-6 font-sans text-sm font-semibold text-charcoal transition-colors hover:bg-opal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
      >
        Register my interest <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </aside>
  )
}
