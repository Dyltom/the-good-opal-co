import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactNode } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { BuilderOpal } from '../config'
import { defaultRingConfig } from '../config'

vi.mock('next/dynamic', () => ({
  default: () =>
    function RingPreviewStub({ selectedOpal }: { selectedOpal?: BuilderOpal }) {
      return (
        <div
          data-testid="ring-preview"
          data-selected-opal={selectedOpal?.id}
          data-selected-image={selectedOpal?.imageUrl}
        />
      )
    },
}))

vi.mock('next/image', () => ({
  default: ({ alt }: ComponentProps<'img'>) => <div role="img" aria-label={alt} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: ComponentProps<'a'> & { children: ReactNode }) => (
    <a href={typeof href === 'string' ? href : String(href)} {...props}>
      {children}
    </a>
  ),
}))

import { RingConfigurator } from '../RingConfigurator'

const opals: BuilderOpal[] = [
  {
    id: '127',
    name: 'Lightning Ridge black opal',
    slug: 'lightning-ridge-black-opal',
    imageUrl: '/black-opal.jpg',
    imageAlt: 'Black opal with blue fire',
    price: 250,
    stoneType: 'black-opal',
    stoneTypeLabel: 'Black opal',
    originLabel: 'Lightning Ridge, NSW',
    weight: 1.2,
    renderStone: 'lightning',
    visual: {
      silhouette: 'oval',
      aspectRatio: 1.3,
      bodyColour: '#071521',
      flashColours: ['#315cff', '#42e29a'],
      transmission: 0.035,
      patternSeed: 127,
      evidence: 'type-fallback',
      recommendedStyle: 'gemini',
    },
  },
  {
    id: '204',
    name: 'Coober Pedy crystal opal',
    slug: 'coober-pedy-crystal-opal',
    imageUrl: '/crystal-opal.jpg',
    imageAlt: 'Crystal opal with green fire',
    price: 175,
    stoneType: 'crystal-opal',
    stoneTypeLabel: 'Crystal opal',
    originLabel: 'Coober Pedy, SA',
    weight: 0.9,
    renderStone: 'blue-green',
    visual: {
      silhouette: 'oval',
      aspectRatio: 1.3,
      bodyColour: '#b9dcd4',
      flashColours: ['#25d5e7', '#4bef9a'],
      transmission: 0.26,
      patternSeed: 204,
      evidence: 'type-fallback',
      recommendedStyle: 'gemini',
    },
  },
]

describe('RingConfigurator store opal selection', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/services/design')
  })

  test('keeps the selected store product and its render palette in shared and enquiry URLs', async () => {
    const user = userEvent.setup()
    render(
      <RingConfigurator
        initialConfig={{ ...defaultRingConfig, opalId: opals[0].id, stone: opals[0].renderStone }}
        opals={opals}
      />
    )

    await user.click(screen.getByRole('button', { name: /Coober Pedy crystal opal/i }))

    await waitFor(() => {
      expect(new URLSearchParams(window.location.search).get('p')).toBe('204')
    })
    expect(screen.getByTestId('ring-preview').getAttribute('data-selected-opal')).toBe('204')
    expect(screen.getByTestId('ring-preview').getAttribute('data-selected-image')).toBe(
      '/crystal-opal.jpg'
    )
    expect(new URLSearchParams(window.location.search).get('o')).toBe('blue-green')
    expect(screen.getByText(/Coober Pedy crystal opal, Gemini design/i)).not.toBeNull()
    expect(
      screen.getByRole('link', { name: /View selected loose opal/i }).getAttribute('href')
    ).toBe('/store/coober-pedy-crystal-opal')

    const consultationHref = screen
      .getByRole('link', { name: /Request my design consultation/i })
      .getAttribute('href')
    expect(consultationHref).not.toBeNull()
    const consultationParams = new URL(consultationHref!, window.location.origin).searchParams
    expect(JSON.parse(consultationParams.get('design') ?? '{}')).toMatchObject({
      opalId: '204',
      stone: 'blue-green',
    })
    expect(consultationParams.get('product')).toContain('Coober Pedy crystal opal')
  })

  test('warns instead of silently substituting an unavailable linked opal', () => {
    render(
      <RingConfigurator initialConfig={defaultRingConfig} opals={opals} unavailableOpalRequested />
    )

    expect(screen.getByRole('status').textContent).toContain('no longer available')
    expect(screen.getByRole('status').textContent).toContain('not substituted')
  })
})
