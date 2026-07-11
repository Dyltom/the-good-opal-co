import type { Course } from '@/types/payload-types'

export const courseFormatLabels: Record<Course['format'], string> = {
  online: 'Online course',
  'live-online': 'Live online',
  'in-person': 'In person',
}

export const courseLevelLabels: Record<Course['level'], string> = {
  beginner: 'Beginner',
  'all-levels': 'All levels',
  intermediate: 'Intermediate',
}

export function courseInterestHref(courseTitle: string): string {
  const params = new URLSearchParams({
    subject: 'course-interest',
    product: courseTitle,
    message: `I would like to register my interest in ${courseTitle}. Please let me know when access, timing, and course details are confirmed.`,
  })

  return `/contact?${params.toString()}`
}

export function courseTopics(value?: string | null): string[] {
  return value
    ? value
        .split('\n')
        .map((topic) => topic.trim())
        .filter(Boolean)
    : []
}
