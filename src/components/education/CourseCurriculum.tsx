import { Check, Plus } from 'lucide-react'
import type { Course } from '@/types/payload-types'
import { courseLessonOutline } from '@/lib/courses'

interface CourseCurriculumProps {
  modules: Course['curriculum']
}

export function CourseCurriculum({ modules }: CourseCurriculumProps) {
  return (
    <ol className="divide-y divide-rule border-y border-rule">
      {modules.map((module, index) => {
        const lessons = courseLessonOutline(module.topics)
        const topicCount = lessons.reduce((count, lesson) => count + lesson.topics.length, 0)
        return (
          <li key={module.id ?? module.title} className="py-5">
            <details className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-start gap-4 [&::-webkit-details-marker]:hidden">
                <span className="mt-1.5 text-xs tabular-nums text-ink-3">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span className="block font-serif text-[1.375rem] leading-tight">
                    {module.title}
                  </span>
                  <span className="mt-1.5 block max-w-[65ch] text-sm leading-6 text-ink-2">
                    {module.summary}
                  </span>
                  {lessons.length > 0 ? (
                    <span className="mt-2 block text-xs text-ink-3">
                      {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} · {topicCount}{' '}
                      {topicCount === 1 ? 'step' : 'steps'}
                    </span>
                  ) : null}
                </span>
                <Plus
                  className="mt-1 h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300 ease-gallery group-open:rotate-45"
                  aria-hidden="true"
                />
              </summary>
              {lessons.length > 0 ? (
                <ol className="ml-8 mt-5 space-y-5 border-t border-rule pt-5">
                  {lessons.map((lesson, lessonIndex) => (
                    <li
                      key={`${lesson.title}-${lessonIndex}`}
                      className="grid gap-3 sm:grid-cols-[2rem_1fr]"
                    >
                      <span className="text-xs tabular-nums text-ink-3">
                        {String(lessonIndex + 1).padStart(2, '0')}
                      </span>
                      <div>
                        {lesson.title ? (
                          <h3 className="text-lg leading-snug">{lesson.title}</h3>
                        ) : null}
                        {lesson.topics.length > 0 ? (
                          <ul className={lesson.title ? 'mt-3 space-y-2' : 'space-y-2'}>
                            {lesson.topics.map((topic) => (
                              <li key={topic} className="flex gap-2.5 text-sm leading-6 text-ink-2">
                                <Check
                                  className="mt-1 h-4 w-4 shrink-0 text-success"
                                  aria-hidden="true"
                                />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : null}
            </details>
          </li>
        )
      })}
    </ol>
  )
}
