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
      photoFit: 'reviewed',
      recommendedStyle: 'gemini',
      textureCrop: { focalX: 0.5, focalY: 0.5, zoom: 3.2 },
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
      photoFit: 'reviewed',
      recommendedStyle: 'gemini',
      textureCrop: { focalX: 0.5, focalY: 0.5, zoom: 3.2 },
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

  test('does not offer no-op crop controls for an estimated or representative listing', () => {
    const estimated = {
      ...opals[0],
      visual: {
        ...opals[0]!.visual,
        photoFit: 'estimated' as const,
        textureCrop: { focalX: 0.5, focalY: 0.5, zoom: 3.2 },
      },
    }

    render(
      <RingConfigurator
        initialConfig={{ ...defaultRingConfig, opalId: estimated.id, stone: estimated.renderStone }}
        opals={[estimated]}
      />
    )

    expect(screen.queryByRole('group', { name: /Adjust the photo crop/i })).toBeNull()
    expect(screen.getByText('4. Ring size (US)')).not.toBeNull()
  })

  test('renders the crop workbench inside the selected sold-style setting', async () => {
    const user = userEvent.setup()
    render(
      <RingConfigurator
        initialConfig={{
          ...defaultRingConfig,
          opalId: opals[0].id,
          stone: opals[0].renderStone,
          style: 'aurora',
          shape: 'oval',
          setting: 'beaded',
        }}
        opals={opals}
      />
    )

    expect(document.querySelector('[data-opal-setting-decoration="aurora"]')).not.toBeNull()
    expect(document.querySelectorAll('[data-opal-setting-grain]').length).toBeGreaterThan(20)
    expect(
      document.querySelector('[data-opal-setting-support]')?.getAttribute('class')
    ).toContain('rounded-[50%]')

    await user.click(screen.getByRole('button', { name: /Coral/i }))

    await waitFor(() => {
      expect(document.querySelector('[data-opal-setting-seat="coral"]')).not.toBeNull()
      expect(document.querySelector('[data-opal-setting-decoration]')).toBeNull()
    })
  })

  test('requires explicit usable zoom before storing photo position', async () => {
    render(
      <RingConfigurator
        initialConfig={{
          ...defaultRingConfig,
          opalId: opals[0].id,
          opalPositionX: 0.45,
          opalScale: 1,
          stone: opals[0].renderStone,
        }}
        opals={opals}
      />
    )

    expect(screen.getByRole('slider', { name: 'Horizontal' })).toHaveProperty('disabled', true)
    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), {
      target: { value: '1.2' },
    })

    await waitFor(() => {
      const preview = screen.getByTestId('ring-preview')
      expect(preview.getAttribute('data-opal-position-x')).toBe('0')
      expect(preview.getAttribute('data-opal-scale')).toBe('1.2')
    })
  })

  test('disables impossible extra zoom for an already maximum-detail crop', () => {
    const maximumDetail = {
      ...opals[0]!,
      visual: { ...opals[0]!.visual, textureCrop: { focalX: 0.5, focalY: 0.5, zoom: 12 } },
    }

    render(
      <RingConfigurator
        initialConfig={{
          ...defaultRingConfig,
          opalId: maximumDetail.id,
          stone: maximumDetail.renderStone,
        }}
        opals={[maximumDetail]}
      />
    )

    expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveProperty('disabled', true)
    expect(screen.getByText('Maximum photo detail')).not.toBeNull()
  })

  test('normalizes over-limit zoom from an old shared design', async () => {
    const highBaseZoom = {
      ...opals[0]!,
      visual: { ...opals[0]!.visual, textureCrop: { focalX: 0.5, focalY: 0.5, zoom: 10 } },
    }

    render(
      <RingConfigurator
        initialConfig={{
          ...defaultRingConfig,
          opalId: highBaseZoom.id,
          opalScale: 2.25,
          stone: highBaseZoom.renderStone,
        }}
        opals={[highBaseZoom]}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('ring-preview').getAttribute('data-opal-scale')).toBe('1.2')
      expect(screen.getByRole('slider', { name: 'Zoom' })).toHaveProperty('value', '1.2')
      expect(new URLSearchParams(window.location.search).get('ps')).toBe('1.2')
    })
  })

  test('preserves unrelated query state and the hash while updating the design URL', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/services/design?utm_source=studio#builder')
    render(<RingConfigurator initialConfig={defaultRingConfig} opals={opals} />)

    await user.click(screen.getByRole('button', { name: /Coral/i }))

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('utm_source')).toBe('studio')
      expect(params.get('y')).toBe('coral')
      expect(window.location.hash).toBe('#builder')
    })
  })

  test('lets every opal try every collection design and preserves it across stone changes', async () => {
    const user = userEvent.setup()
    render(
      <RingConfigurator
        initialConfig={{ ...defaultRingConfig, opalId: opals[0].id, stone: opals[0].renderStone }}
        opals={opals}
      />
    )

    const aurora = screen.getByRole('button', { name: /Aurora/i })
    const coral = screen.getByRole('button', { name: /Coral/i })
    const sunMoon = screen.getByRole('button', { name: /Sun & Moon/i })
    expect(aurora.hasAttribute('disabled')).toBe(false)
    expect(coral.hasAttribute('disabled')).toBe(false)
    expect(sunMoon.hasAttribute('disabled')).toBe(false)

    await user.click(aurora)
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('y')).toBe('aurora')
      expect(params.get('s')).toBe('oval')
    })

    await user.click(screen.getByRole('button', { name: /Coober Pedy crystal opal/i }))
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('p')).toBe('204')
      expect(params.get('y')).toBe('aurora')
      expect(params.get('s')).toBe('oval')
    })
    expect(screen.getByRole('button', { name: /Aurora/i }).textContent).toContain(
      'Adapted to oval opal'
    )
  })

  test('uses each collection reference shape until a store opal is selected', async () => {
    const user = userEvent.setup()
    render(<RingConfigurator initialConfig={defaultRingConfig} opals={[]} />)

    await user.click(screen.getByRole('button', { name: /Coral/i }))

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('y')).toBe('coral')
      expect(params.get('s')).toBe('cushion')
    })

    await user.click(screen.getByRole('button', { name: /Aurora/i }))

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('y')).toBe('aurora')
      expect(params.get('s')).toBe('pear')
    })
  })

  test('returns from a store opal to the selected collection reference', async () => {
    const user = userEvent.setup()
    render(<RingConfigurator initialConfig={defaultRingConfig} opals={opals} />)

    await user.click(screen.getByRole('button', { name: /Aurora/i }))
    await user.click(screen.getByRole('button', { name: /Lightning Ridge black opal/i }))

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('p')).toBe('127')
      expect(params.get('s')).toBe('oval')
    })

    const referencePreview = screen.getByRole('button', {
      name: 'Preview collection reference',
    })
    expect(referencePreview.getAttribute('aria-pressed')).toBe('false')
    await user.click(referencePreview)

    await waitFor(() => {
      const params = new URLSearchParams(window.location.search)
      expect(params.get('p')).toBeNull()
      expect(params.get('y')).toBe('aurora')
      expect(params.get('s')).toBe('pear')
    })
    expect(referencePreview.getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('ring-preview').getAttribute('data-selected-opal')).toBeNull()
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

    fireEvent.change(screen.getByRole('slider', { name: 'Zoom' }), {
      target: { value: '1.4' },
    })
    fireEvent.change(screen.getByRole('slider', { name: 'Horizontal' }), {
      target: { value: '0.2' },
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
        initialConfig={{
          ...defaultRingConfig,
          opalId: opals[0].id,
          opalScale: 1.25,
          stone: opals[0].renderStone,
        }}
        opals={opals}
      />
    )

    const placement = screen.getByRole('group', {
      name: /Adjust the photo crop/i,
    })
    for (let index = 0; index < 6; index += 1) {
      fireEvent.keyDown(placement, { key: 'ArrowRight' })
    }
    fireEvent.click(screen.getByRole('button', { name: 'Rotate opal colour right' }))

    await waitFor(() => {
      const preview = screen.getByTestId('ring-preview')
      expect(preview.getAttribute('data-opal-position-x')).toBe('0.06')
      expect(preview.getAttribute('data-opal-rotation')).toBe('15')
      expect(new URLSearchParams(window.location.search).get('px')).toBe('0.06')
    })
    expect(placement.className).toContain('touch-none')
    expect(placement.parentElement?.className).not.toContain('touch-none')
  })

  test('maps one aperture-centre drag to the full placement range with concise URLs', async () => {
    render(
      <RingConfigurator
        initialConfig={{
          ...defaultRingConfig,
          opalId: opals[0].id,
          opalScale: 1.25,
          stone: opals[0].renderStone,
        }}
        opals={opals}
      />
    )

    const placement = screen.getByRole('group', {
      name: /Adjust the photo crop/i,
    })
    const aperture = placement
    expect(aperture.hasAttribute('data-opal-placement-aperture')).toBe(true)
    Object.defineProperty(placement, 'setPointerCapture', { value: vi.fn() })
    vi.spyOn(aperture!, 'getBoundingClientRect').mockReturnValue({
      bottom: 300,
      height: 200,
      left: 100,
      right: 300,
      top: 100,
      width: 200,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    })

    fireEvent.pointerDown(placement, { clientX: 200, clientY: 200, pointerId: 1 })
    fireEvent.pointerMove(placement, { clientX: 300, clientY: 200, pointerId: 1 })

    await waitFor(() => {
      const position = new URLSearchParams(window.location.search).get('px')
      expect(position).toMatch(/^-?\d+(?:\.\d{1,3})?$/)
      expect(position).toBe('0.45')
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

    const picker = screen.getByRole('group', { name: '3. Choose an available opal' })
    expect(picker.querySelectorAll('button[data-opal-id]').length).toBe(12)
    expect(screen.getByText('15 listings found')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: 'Show 12 more' }))
    expect(picker.querySelectorAll('button[data-opal-id]').length).toBe(15)

    await user.type(screen.getByRole('searchbox', { name: 'Search available opals' }), 'parcel')
    await waitFor(() => expect(screen.getByText('1 listing found')).not.toBeNull())
    expect(picker.querySelectorAll('button[data-opal-id]').length).toBe(1)
    expect(screen.getByRole('button', { name: /Coober Pedy colour parcel/i })).not.toBeNull()
    expect(screen.getByText('3D shows a representative setting concept')).not.toBeNull()
  })

  test('pins a linked deep-catalogue opal without rendering every preceding card', () => {
    const catalogue = Array.from({ length: 90 }, (_, index) => ({
      ...opals[0]!,
      id: `opal-${index + 1}`,
      name: `Individual opal ${index + 1}`,
      slug: `individual-opal-${index + 1}`,
    }))
    const selectedId = 'opal-81'

    render(
      <RingConfigurator
        initialConfig={{ ...defaultRingConfig, opalId: selectedId }}
        opals={catalogue}
      />
    )

    const styles = screen.getByRole('group', { name: '2. Choose a collection design' })
    const picker = screen.getByRole('group', { name: '3. Choose an available opal' })
    expect(styles.compareDocumentPosition(picker) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(picker.querySelectorAll('button[data-opal-id]').length).toBe(12)
    expect(screen.getByRole('button', { name: /Individual opal 81/i })).not.toBeNull()
  })
})
