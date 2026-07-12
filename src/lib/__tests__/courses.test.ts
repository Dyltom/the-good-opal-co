import { describe, expect, test } from 'vitest'
import {
  courseInterestHref,
  courseLessonOutline,
  courseOutlineStats,
  courseTopics,
} from '@/lib/courses'

describe('course public helpers', () => {
  test('builds an interest-only contact handoff without checkout state', () => {
    const href = courseInterestHref('The Complete Opal Cutting & Valuation Course')
    const query = new URL(href, 'https://example.com').searchParams

    expect(query.get('subject')).toBe('course-interest')
    expect(query.get('product')).toBe('The Complete Opal Cutting & Valuation Course')
    expect(query.get('message')).toContain('not enrolment or payment')
    expect(query.get('message')).toContain('format, timing, and availability')
    expect(href).not.toContain('price')
    expect(href).not.toContain('checkout')
  })

  test('turns editor topic lines into a clean public list', () => {
    expect(courseTopics('Colour bars and potch\n\n Safety first \nPolishing')).toEqual([
      'Colour bars and potch',
      'Safety first',
      'Polishing',
    ])
  })

  test('preserves the legacy plain-line syllabus as one lesson group', () => {
    expect(courseLessonOutline('Colour bars\nPolishing')).toEqual([
      { title: '', topics: ['Colour bars', 'Polishing'] },
    ])
  })

  test('parses lesson headings and optional topic markers into a public hierarchy', () => {
    expect(
      courseLessonOutline(`## Inspecting rough
- Colour bars and potch
- Host rock
## Finishing
Polishing`)
    ).toEqual([
      { title: 'Inspecting rough', topics: ['Colour bars and potch', 'Host rock'] },
      { title: 'Finishing', topics: ['Polishing'] },
    ])
  })

  test('counts published lesson groups and steps across the curriculum', () => {
    expect(
      courseOutlineStats([
        {
          id: 'one',
          title: 'Module one',
          summary: 'First module',
          topics: '## Lesson one\nStep one\nStep two',
        },
        {
          id: 'two',
          title: 'Module two',
          summary: 'Second module',
          topics: '## Lesson two\nStep three\n## Lesson three\nStep four',
        },
      ])
    ).toEqual({ lessons: 3, topics: 4 })
  })
})
