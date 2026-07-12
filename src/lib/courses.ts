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
    message: `I would like updates about ${courseTitle}. Please let me know when its format, timing, and availability are confirmed. I understand this enquiry is not enrolment or payment.`,
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

export interface CourseLessonOutline {
  title: string
  topics: string[]
}

/**
 * Turns the compact, editor-friendly syllabus field into lesson groups.
 * A line beginning with `## ` starts a lesson; following lines are its topics.
 * Legacy plain-line values remain usable as one untitled group.
 */
export function courseLessonOutline(value?: string | null): CourseLessonOutline[] {
  const lines = courseTopics(value)
  if (lines.length === 0) return []

  const lessons: CourseLessonOutline[] = []

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim()
      if (title) lessons.push({ title, topics: [] })
      continue
    }

    const topic = line.startsWith('- ') ? line.slice(2).trim() : line
    if (!topic) continue

    const currentLesson = lessons.at(-1)
    if (currentLesson) {
      currentLesson.topics.push(topic)
    } else {
      lessons.push({ title: '', topics: [topic] })
    }
  }

  return lessons.filter((lesson) => lesson.title || lesson.topics.length > 0)
}

export function courseOutlineStats(curriculum: Course['curriculum']): {
  lessons: number
  topics: number
} {
  return curriculum.reduce(
    (totals, module) => {
      const lessons = courseLessonOutline(module.topics)
      totals.lessons += lessons.length
      totals.topics += lessons.reduce((count, lesson) => count + lesson.topics.length, 0)
      return totals
    },
    { lessons: 0, topics: 0 }
  )
}
