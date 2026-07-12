import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactNode } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { BuilderOpal } from '../config'
import { defaultRingConfig } from '../config'

vi.mock('next/dynamic', () => ({
  default: () =>
    function RingPreviewStub({
      config,
      selectedOpal,
    }: {
      config: typeof defaultRingConfig
      selectedOpal?: BuilderOpal
    }) {
      return (
        <div
          data-testid="ring-preview"
          data-selected-opal={selectedOpal?.id}
          data-selected-image={selectedOpal?.imageUrl}
          data-opal-position-x={config.opalPositionX}
          data-opal-scale={config.opalScale}
          data-opal-rotation={config.opalRotation}
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
    selectionKind: 'individual',
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
    selectionKind: 'individual',
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

  test('persists approximate opal placement in the share URL and consultation payload', async () => {
    render(
      <RingConfigurator
        initialConfig={{ ...defaultRingConfig, opalId: opals[0].id, stone: opals[0].renderStone }}
        opals={opals}
      />
    )

    fireEvent.change(screen.getByRole('slider', { name: 'Horizontal' }), {
      target: { value: '0.2' },
    })
    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), {
      target: { value: '1.4' },
    })
    fireEvent.change(screen.getByRole('slider', { name: 'Rotation' }), {
      target: { value: '35' },
    })

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('px')).toBe('0.2')
      expect(params.get('ps')).toBe('1.4')
      expect(params.get('pr')).toBe('35')
    })
    expect(screen.getByTestId('ring-preview').getAttribute('data-opal-position-x')).toBe('0.2')
    expect(screen.getByTestId('ring-preview').getAttribute('data-opal-scale')).toBe('1.4')
    expect(screen.getByTestId('ring-preview').getAttribute('data-opal-rotation')).toBe('35')

    const consultationHref = screen
      .getByRole('link', { name: /Request my design consultation/i })
      .getAttribute('href')
    const consultationParams = new URL(consultationHref!, window.location.origin).searchParams
    expect(JSON.parse(consultationParams.get('design') ?? '{}')).toMatchObject({
      opalPositionX: 0.2,
      opalScale: 1.4,
      opalRotation: 35,
    })
  })

  test('supports direct keyboard positioning and simple rotation controls', async () => {
    render(
      <RingConfigurator
        initialConfig={{ ...defaultRingConfig, opalId: opals[0].id, stone: opals[0].renderStone }}
        opals={opals}
      />
    )

    fireEvent.keyDown(
      screen.getByRole('group', {
        name: /Adjust approximate cut placement/i,
      }),
      { key: 'ArrowRight' }
    )
    fireEvent.click(screen.getByRole('button', { name: 'Rotate opal right' }))

    await waitFor(() => {
      const preview = screen.getByTestId('ring-preview')
      expect(preview.getAttribute('data-opal-position-x')).toBe('0.01')
      expect(preview.getAttribute('data-opal-rotation')).toBe('15')
    })
  })

  test('keeps direct drag coordinates concise in shared URLs', async () => {
    render(
      <RingConfigurator
        initialConfig={{ ...defaultRingConfig, opalId: opals[0].id, stone: opals[0].renderStone }}
        opals={opals}
      />
    )

    const placement = screen.getByRole('group', {
      name: /Adjust approximate cut placement/i,
    })
    Object.defineProperty(placement, 'setPointerCapture', { value: vi.fn() })
    vi.spyOn(placement, 'getBoundingClientRect').mockReturnValue({
      bottom: 400,
      height: 300,
      left: 100,
      right: 400,
      top: 100,
      width: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    })

    fireEvent.pointerDown(placement, { clientX: 150, clientY: 150, pointerId: 1 })
    fireEvent.pointerMove(placement, { clientX: 173.456, clientY: 167.891, pointerId: 1 })

    await waitFor(() => {
      const position = new URLSearchParams(window.location.search).get('px')
      expect(position).toMatch(/^-?\d+(?:\.\d{1,3})?$/)
    })
  })

  test('searches a large live catalogue and renders it progressively', async () => {
    const user = userEvent.setup()
    const catalogue = [
      ...Array.from({ length: 14 }, (_, index) => ({
        ...opals[0]!,
        id: `individual-${index}`,
        name: `Individual opal ${index + 1}`,
        slug: `individual-opal-${index + 1}`,
      })),
      {
        ...opals[1]!,
        id: 'parcel-1',
        name: 'Coober Pedy colour parcel',
        slug: 'coober-pedy-colour-parcel',
        selectionKind: 'parcel' as const,
      },
    ]

    render(<RingConfigurator initialConfig={defaultRingConfig} opals={catalogue} />)

    const picker = screen.getByRole('group', { name: '2. Choose an available opal' })
    expect(picker.querySelectorAll('button[aria-pressed]').length).toBe(12)
    expect(screen.getByText('15 listings found')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Show 12 more' }))
    expect(picker.querySelectorAll('button[aria-pressed]').length).toBe(15)

    await user.type(screen.getByRole('searchbox', { name: 'Search available opals' }), 'parcel')
    await waitFor(() => expect(screen.getByText('1 listing found')).not.toBeNull())
    expect(picker.querySelectorAll('button[aria-pressed]').length).toBe(1)
    expect(screen.getByRole('button', { name: /Coober Pedy colour parcel/i })).not.toBeNull()
    expect(screen.getByText('3D shows a representative setting concept')).not.toBeNull()
  })
})
