import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { createElement } from 'react'
import { describe, expect, test, vi } from 'vitest'
import type { BuilderOpal, OpalPlacement } from '../config'

vi.mock('next/image', () => ({
  default: ({ fill: _fill, ...props }: ComponentProps<'img'> & { fill?: boolean }) =>
    createElement('img', props),
}))

import { OpalFaceImage } from '../OpalFaceImage'

const opal: BuilderOpal = {
  id: 'rotated-opal',
  name: 'Rotated opal',
  slug: 'rotated-opal',
  imageUrl: '/rotated-opal.jpg',
  imageAlt: 'Rotated opal',
  price: 250,
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
    recommendedStyle: 'gemini',
    textureCrop: { focalX: 0.48, focalY: 0.52, zoom: 3.4, rotation: -90 },
  },
}

const placement: OpalPlacement = {
  opalPositionX: 0,
  opalPositionY: 0,
  opalScale: 1,
  opalRotation: 15,
}

describe('OpalFaceImage', () => {
  test('reveals one stable image only after its exact crop is ready', () => {
    const { rerender } = render(
      <OpalFaceImage alt="Selected opal" eager opal={opal} placement={placement} sizes="360px" />
    )

    const image = screen.getByRole('img', { name: 'Selected opal' }) as HTMLImageElement
    const frame = image.parentElement?.parentElement
    expect(frame?.getAttribute('data-opal-photo-state')).toBe('loading')
    expect(frame?.getAttribute('aria-busy')).toBe('true')
    expect(image.getAttribute('loading')).toBe('eager')
    expect(image.getAttribute('draggable')).toBe('false')
    expect(image.className).toContain('opacity-0')

    Object.defineProperties(image, {
      naturalHeight: { configurable: true, value: 1920 },
      naturalWidth: { configurable: true, value: 1839 },
    })
    fireEvent.load(image)

    const croppedImage = screen.getByRole('img', { name: 'Selected opal' })
    expect(croppedImage).toBe(image)
    expect(croppedImage.parentElement?.className).toContain('absolute')
    expect(croppedImage.parentElement?.style.width).not.toBe('')
    expect(croppedImage.parentElement?.style.transform).toContain('rotate(-75deg)')
    expect(croppedImage.className).toContain('opacity-100')
    expect(frame?.getAttribute('data-opal-photo-state')).toBe('ready')
    expect(frame?.getAttribute('aria-busy')).toBe('false')

    rerender(
      <OpalFaceImage
        alt="Selected opal"
        eager
        opal={{ ...opal, imageUrl: '/new-opal.jpg' }}
        placement={placement}
        sizes="360px"
      />
    )

    const nextImage = screen.getByRole('img', { name: 'Selected opal' })
    expect(nextImage).toBe(image)
    expect(nextImage.className).toContain('opacity-0')
    expect(nextImage.parentElement?.parentElement?.getAttribute('data-opal-photo-state')).toBe(
      'loading'
    )
  })
})
