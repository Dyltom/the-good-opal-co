import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { createElement } from 'react'
import { describe, expect, test, vi } from 'vitest'
import type { BuilderOpal, OpalPlacement } from '../config'
import { defaultOpalPlacement } from '../config'
import { getRenderedStoneAspect, getStyleBeadCount } from '../geometry'

vi.mock('next/image', () => ({
  default: ({ fill: _fill, ...props }: ComponentProps<'img'> & { fill?: boolean }) =>
    createElement('img', props),
}))

import { OpalPlacementEditor } from '../OpalPlacementEditor'

const opal: BuilderOpal = {
  id: 'precise-opal',
  name: 'Lightning Ridge black opal',
  slug: 'precise-opal',
  imageUrl: '/precise-opal.jpg',
  imageAlt: 'Black opal with green fire',
  price: 420,
  stoneType: 'black-opal',
  stoneTypeLabel: 'Black opal',
  selectionKind: 'individual',
  renderStone: 'lightning',
  visual: {
    silhouette: 'oval',
    aspectRatio: 1.3,
    bodyColour: '#173350',
    flashColours: ['#16d7ef', '#43ef8f'],
    transmission: 0.08,
    patternSeed: 42,
    evidence: 'catalogue',
    photoFit: 'reviewed',
    recommendedStyle: 'coral',
    textureCrop: { focalX: 0.48, focalY: 0.52, zoom: 3.4 },
  },
}

function renderEditor(placement: OpalPlacement, onChange = vi.fn()) {
  return {
    onChange,
    ...render(
      <OpalPlacementEditor
        metal="sterling-silver"
        onChange={onChange}
        opal={opal}
        placement={placement}
        style="coral"
      />
    ),
  }
}

describe('OpalPlacementEditor', () => {
  test('states crop and outline fidelity without calling a generic outline exact', () => {
    renderEditor(defaultOpalPlacement)

    expect(screen.getByText('Reviewed colour crop')).not.toBeNull()
    expect(
      screen.getByText(
        'Move the selected listing colour inside a supported outline preview. Stone scale and setting geometry stay fixed; only the colour framing changes.'
      )
    ).not.toBeNull()
    expect(
      screen.getByText(
        'Outline scale is normalized until measurements are verified. Your maker confirms the exact traced seat.'
      )
    ).not.toBeNull()
    expect(screen.queryByText('Reviewed source photo')).toBeNull()
  })

  test('renders halo grains from the shared sold-style geometry profile', () => {
    const auroraOpal: BuilderOpal = {
      ...opal,
      visual: { ...opal.visual, aspectRatio: 0.8, silhouette: 'pear' },
    }
    const { container } = render(
      <OpalPlacementEditor
        metal="sterling-silver"
        onChange={vi.fn()}
        opal={auroraOpal}
        placement={defaultOpalPlacement}
        style="aurora"
      />
    )

    const grains = container.querySelectorAll('[data-opal-halo-grain="aurora"]')
    const stoneAspect = getRenderedStoneAspect({ shape: 'pear' }, auroraOpal)
    expect(grains).toHaveLength(getStyleBeadCount('aurora', 'pear', 0.5, 0.5 / stoneAspect))
    expect((grains[0] as HTMLElement).style.width).toBe('9%')
    expect((grains[0] as HTMLElement).style.backgroundImage).toContain('linear-gradient')
  })

  test('describes fine placement values in visual directions', () => {
    renderEditor({
      opalPositionX: 0.225,
      opalPositionY: -0.225,
      opalScale: 1.5,
      opalRotation: 15,
    })

    expect(screen.getByRole('slider', { name: 'Zoom' }).getAttribute('aria-valuetext')).toBe(
      '1.50×'
    )
    expect(screen.getByRole('slider', { name: 'Horizontal' }).getAttribute('aria-valuetext')).toBe(
      '50% right'
    )
    expect(screen.getByRole('slider', { name: 'Vertical' }).getAttribute('aria-valuetext')).toBe(
      '50% up'
    )
    expect(screen.getByRole('slider', { name: 'Rotation' }).getAttribute('aria-valuetext')).toBe(
      '15°'
    )
    expect(
      screen.getByRole('group', { name: /Horizontal 50% right, vertical 50% up/i })
    ).not.toBeNull()
  })

  test('disables controls that cannot make another change', () => {
    const { rerender } = renderEditor(defaultOpalPlacement)

    expect(screen.getByRole('button', { name: 'Reset photo crop' })).toHaveProperty(
      'disabled',
      true
    )

    rerender(
      <OpalPlacementEditor
        metal="sterling-silver"
        onChange={vi.fn()}
        opal={opal}
        placement={{ ...defaultOpalPlacement, opalRotation: 180 }}
        style="coral"
      />
    )

    expect(screen.getByRole('button', { name: 'Rotate opal colour right' })).toHaveProperty(
      'disabled',
      true
    )
    expect(screen.getByRole('button', { name: 'Rotate opal colour left' })).toHaveProperty(
      'disabled',
      false
    )
  })

  test('ignores non-primary and zero-size drag starts', () => {
    const onChange = vi.fn()
    renderEditor({ ...defaultOpalPlacement, opalScale: 1.25 }, onChange)
    const aperture = screen.getByRole('group', { name: /Adjust the photo crop/i })
    const viewport = document.querySelector('[data-opal-placement-crop-viewport]') as HTMLDivElement
    Object.defineProperty(aperture, 'setPointerCapture', { value: vi.fn() })

    fireEvent.pointerDown(aperture, {
      button: 2,
      clientX: 100,
      clientY: 100,
      pointerId: 1,
    })
    fireEvent.pointerMove(aperture, { clientX: 120, clientY: 120, pointerId: 1 })

    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    fireEvent.pointerDown(aperture, {
      button: 0,
      clientX: 100,
      clientY: 100,
      pointerId: 2,
    })
    fireEvent.pointerMove(aperture, { clientX: 120, clientY: 120, pointerId: 2 })

    expect(onChange).not.toHaveBeenCalled()
  })

  test('does not silently zoom the reviewed crop when direct positioning starts', () => {
    const onChange = vi.fn()
    renderEditor(defaultOpalPlacement, onChange)
    const aperture = screen.getByRole('group', { name: /Adjust the photo crop/i })
    const viewport = document.querySelector('[data-opal-placement-crop-viewport]') as HTMLDivElement
    Object.defineProperty(aperture, 'setPointerCapture', { value: vi.fn() })
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
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

    fireEvent.pointerDown(aperture, {
      button: 0,
      clientX: 200,
      clientY: 200,
      pointerId: 7,
    })
    fireEvent.pointerMove(aperture, { clientX: 220, clientY: 180, pointerId: 7 })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Start framing colour' })).toBeTruthy()
  })

  test('starts movable framing only after an explicit customer action', () => {
    const onChange = vi.fn()
    renderEditor(defaultOpalPlacement, onChange)

    fireEvent.click(screen.getByRole('button', { name: 'Start framing colour' }))

    expect(onChange).toHaveBeenCalledWith({
      ...defaultOpalPlacement,
      opalScale: 1.15,
    })
  })

  test('moves the photo at the customer-selected zoom without changing magnification', () => {
    const onChange = vi.fn()
    renderEditor({ ...defaultOpalPlacement, opalScale: 1.25 }, onChange)
    const aperture = screen.getByRole('group', { name: /Adjust the photo crop/i })
    const viewport = document.querySelector('[data-opal-placement-crop-viewport]') as HTMLDivElement
    Object.defineProperty(aperture, 'setPointerCapture', { value: vi.fn() })
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue({
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

    fireEvent.pointerDown(aperture, {
      button: 0,
      clientX: 200,
      clientY: 200,
      pointerId: 8,
    })
    fireEvent.pointerMove(aperture, { clientX: 220, clientY: 180, pointerId: 8 })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({
      ...defaultOpalPlacement,
      opalPositionX: 0.09,
      opalPositionY: -0.09,
      opalScale: 1.25,
    })
  })
})
