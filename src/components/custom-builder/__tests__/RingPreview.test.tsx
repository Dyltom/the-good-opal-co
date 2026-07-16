import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import type { RingRenderModelSelection } from '@/lib/custom-builder/ring-render-model'
import { defaultRingConfig, getRingStyleReferenceOpal, ringStyles } from '../config'
import { RingPreview } from '../RingPreview'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span role="img" aria-label={alt} data-src={src} />
  ),
}))

vi.mock('../RingScene', () => ({
  RingScene: ({ onApprovedAssetFailure }: { onApprovedAssetFailure?: () => void }) => (
    <button type="button" onClick={onApprovedAssetFailure}>
      Simulate asset failure
    </button>
  ),
}))

const proceduralModel = {
  kind: 'procedural',
  makerApproved: false,
  reason: 'missing-manifest',
  version: 'procedural-v4',
} as const

const approvedAssetModel = {
  kind: 'asset',
  makerApproved: true,
  manifest: {
    approval: { approvedAt: '2026-07-16T00:00:00.000Z', notes: 'Maker approved master.' },
    id: 1,
    model: {
      contractVersion: 'ring-asset-v1',
      source: 'artist-authored',
      variants: [],
      version: 'gemini-v4',
    },
    name: 'Gemini',
    slug: 'gemini',
    style: 'gemini',
  },
  variant: {
    asset: { sha256: 'a'.repeat(64) },
  },
} as unknown as RingRenderModelSelection
const makerOpal = getRingStyleReferenceOpal('gemini')

describe('RingPreview sold-design comparison', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as WebGLRenderingContext
    )
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  })

  test.each(ringStyles)('shows the owned $label reference without relabeling the concept', (style) => {
    render(
      <RingPreview
        config={{ ...defaultRingConfig, style: style.id }}
        description={`${style.label} ring concept`}
        reference={{ image: style.referenceImage, name: style.referenceName }}
        renderModel={proceduralModel}
      />
    )

    expect(screen.getByText('Concept')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Sold ring reference' }))

    expect(screen.getByText('Sold reference')).not.toBeNull()
    expect(screen.getByText(style.referenceName)).not.toBeNull()
    expect(
      screen
        .getByRole('img', {
          name: `${style.referenceName}, sold Good Opal Co ring reference`,
        })
        .getAttribute('data-src')
    ).toBe(style.referenceImage)
    expect(screen.getByText(/Your selected opal changes the final fit and scale/)).not.toBeNull()
  })

  test('downgrades a failed approved asset to Concept', () => {
    const style = ringStyles[0]!
    render(
      <RingPreview
        config={defaultRingConfig}
        description="Approved Gemini ring"
        reference={{ image: style.referenceImage, name: style.referenceName }}
        renderModel={approvedAssetModel}
        selectedOpal={makerOpal}
      />
    )

    expect(screen.getByText('Maker-approved model')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Simulate asset failure' }))
    expect(screen.getByText('Concept')).not.toBeNull()
  })

  test('retries the same asset only when its physical fit changes', () => {
    const style = ringStyles[0]!
    const props = {
      config: defaultRingConfig,
      description: 'Approved Gemini ring',
      reference: { image: style.referenceImage, name: style.referenceName },
      renderModel: approvedAssetModel,
      selectedOpal: makerOpal,
    }
    const { rerender } = render(<RingPreview {...props} />)

    fireEvent.click(screen.getByRole('button', { name: 'Simulate asset failure' }))
    expect(screen.getByText('Concept')).not.toBeNull()

    rerender(<RingPreview {...props} config={{ ...props.config, size: 8 }} />)
    expect(screen.getByText('Maker-approved model')).not.toBeNull()
  })
})
