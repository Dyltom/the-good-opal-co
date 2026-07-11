import { Check } from 'lucide-react'
import type { Course } from '@/types/payload-types'
import { courseTopics } from '@/lib/courses'

interface CourseCurriculumProps {
  modules: Course['curriculum']
}

export function CourseCurriculum({ modules }: CourseCurriculumProps) {
  return (
    <ol className="divide-y divide-warm-grey/70 border-y border-warm-grey/70">
      {modules.map((module, index) => {
        const topics = courseTopics(module.topics)
        return (
          <li key={module.id ?? module.title} className="py-7 sm:py-9">
            <details className="group" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-start gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden">
                <span className="mt-1 font-sans text-xs font-semibold tabular-nums text-opal-electric-accessible">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">
                  <span className="block font-serif text-2xl font-medium leading-tight sm:text-3xl">
                    {module.title}
                  </span>
                  <span className="mt-2 block max-w-2xl font-sans text-sm leading-6 text-charcoal/65">
                    {module.summary}
                  </span>
                </span>
                <span
                  className="mt-1 font-sans text-xl text-charcoal/45 transition-transform duration-300 group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              {topics.length > 0 ? (
                <ul className="ml-9 mt-6 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
                  {topics.map((topic) => (
                    <li
                      key={topic}
                      className="flex gap-2.5 font-sans text-sm leading-6 text-charcoal/75"
                    >
                      <Check
                        className="mt-1 h-4 w-4 shrink-0 text-opal-emerald-dark"
                        aria-hidden="true"
                      />
                      {topic}
                    </li>
                  ))}
                </ul>
              ) : null}
            </details>
          </li>
        )
      })}
    </ol>
  )
}
