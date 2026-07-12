import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { CourseCurriculum } from '../CourseCurriculum'

describe('CourseCurriculum', () => {
  test('renders the public syllabus as modules, lessons, and steps', () => {
    render(
      <CourseCurriculum
        modules={[
          {
            id: 'anatomy',
            title: 'Module 1: Opal anatomy',
            summary: 'Understand what is inside rough opal.',
            topics:
              '## Lesson 1: Inspecting rough\nColour bars and potch\nHost rock\n## Lesson 2: Opal types\nCrystal opal',
          },
        ]}
      />
    )

    expect(screen.getByText('2 lessons · 3 steps')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Lesson 1: Inspecting rough' })).toBeDefined()
    expect(screen.getByRole('heading', { name: 'Lesson 2: Opal types' })).toBeDefined()
    expect(screen.getByText('Colour bars and potch')).toBeDefined()
  })

  test('keeps a legacy plain-line outline visible', () => {
    render(
      <CourseCurriculum
        modules={[
          {
            id: 'legacy',
            title: 'Legacy module',
            summary: 'Imported outline.',
            topics: 'Planning\nPolishing',
          },
        ]}
      />
    )

    expect(screen.getByText('1 lesson · 2 steps')).toBeDefined()
    expect(screen.getByText('Planning')).toBeDefined()
    expect(screen.getByText('Polishing')).toBeDefined()
  })
})
