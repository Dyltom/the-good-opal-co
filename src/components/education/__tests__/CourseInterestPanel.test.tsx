import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { CourseInterestPanel } from '../CourseInterestPanel'

describe('CourseInterestPanel', () => {
  test('describes an open course lead as interest only', () => {
    render(
      <CourseInterestPanel
        course={{ title: 'Opal Cutting Foundations', availability: 'register-interest' }}
      />
    )

    expect(screen.getByText(/not enrolment or payment/i)).toBeDefined()
    expect(
      screen.getByRole('link', { name: /send course interest/i }).getAttribute('href')
    ).toContain('subject=course-interest')
    expect(screen.queryByText(/1:1|guided course|account-gated/i)).toBeNull()
  })

  test('does not offer an enquiry when interest is closed', () => {
    render(
      <CourseInterestPanel course={{ title: 'Opal Cutting Foundations', availability: 'closed' }} />
    )

    expect(screen.getByText('Interest is currently closed.')).toBeDefined()
    expect(screen.queryByRole('link', { name: /send course interest/i })).toBeNull()
  })
})
