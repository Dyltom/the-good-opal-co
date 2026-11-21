import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Course } from '@/types/payload-types'
import { Button } from '@/components/ui/button'
import { courseInterestHref } from '@/lib/courses'

interface CourseInterestPanelProps {
  course: Pick<Course, 'title' | 'availability'>
}

export function CourseInterestPanel({ course }: CourseInterestPanelProps) {
  if (course.availability === 'closed') {
    return (
      <aside className="bg-plinth p-6 sm:p-7" aria-label="Course availability">
        <h2 className="text-[1.5rem] leading-tight">Interest is currently closed.</h2>
        <p className="mt-3 text-sm leading-6 text-ink-2">
          Explore the free cutting guides while the next course decision is made.
        </p>
        <Button asChild variant="ghost" className="mt-5">
          <Link href="/blog">
            Read free guides <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </aside>
    )
  }

  return (
    <aside className="bg-plinth p-6 sm:p-7" aria-label="Course interest enquiry">
      <h2 className="text-[1.5rem] leading-tight">Hear when the course plan is confirmed.</h2>
      <p className="mt-2 text-[13px] text-ink-3">
        {course.availability === 'coming-soon' ? 'Coming soon' : 'Interest enquiries open'}
      </p>
      <p className="mt-3 text-sm leading-6 text-ink-2">
        This sends an interest enquiry only. It is not enrolment or payment. Tell us your experience
        level and what you want to learn, then we will reply with confirmed details.
      </p>
      <Button asChild className="mt-5">
        <Link href={courseInterestHref(course.title)}>
          Send course interest <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </aside>
  )
}
