import { render, screen } from '@testing-library/react'
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
  test('combines reviewed photo rotation with customer placement rotation', () => {
    render(<OpalFaceImage alt="Selected opal" opal={opal} placement={placement} />)

    const image = screen.getByRole('img', { name: 'Selected opal' }) as HTMLImageElement
    expect(image.style.transform).toContain('rotate(-75deg)')
  })
})
