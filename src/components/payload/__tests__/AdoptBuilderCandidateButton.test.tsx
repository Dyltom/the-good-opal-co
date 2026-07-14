import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  category: 'raw-opals',
  fetch: vi.fn(),
  useDocumentInfo: vi.fn(),
  useFormFields: vi.fn(),
}))

vi.mock('@payloadcms/ui', () => ({
  useDocumentInfo: mocks.useDocumentInfo,
  useFormFields: mocks.useFormFields,
}))

import { AdoptBuilderCandidateButton } from '../AdoptBuilderCandidateButton'

const contour = { version: 1 as const, radii: Array.from({ length: 96 }, () => 1) }
const review = {
  active: {
    contour: null,
    crop: { focalX: 0.5, focalY: 0.5, rotation: 0, zoom: 2 },
    eligible: false,
    mappingStatus: 'pending' as const,
    matchesCandidateContour: false,
    matchesCandidateCrop: false,
    sourceIsCurrent: false,
  },
  candidate: {
    adoptable: true,
    analysisError: null,
    analysisVersion: 3,
    confidence: 0.86,
    contour,
    crop: { focalX: 0.42, focalY: 0.57, rotation: -12, zoom: 3.4 },
    genericFallback: false,
    placementAdoptable: true,
    sourceImageHash: 'a'.repeat(64),
  },
  dimensions: { depth: 2.5, length: 9, width: 6 },
  product: { id: 42, name: 'Lightning Ridge black opal', silhouette: 'oval' },
  sourceImage: {
    alt: 'Black opal on a neutral background',
    height: 1600,
    url: '/api/media/file/black-opal.jpg',
    width: 1200,
  },
}

function response(body: unknown, ok = true): Pick<Response, 'json' | 'ok'> {
  return { json: () => Promise.resolve(body), ok }
}

describe('AdoptBuilderCandidateButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.category = 'raw-opals'
    mocks.useDocumentInfo.mockReturnValue({ id: 42 })
    mocks.useFormFields.mockImplementation(
      (selector: (context: [{ category: { value: string } }]) => unknown) =>
        selector([{ category: { value: mocks.category } }])
    )
    mocks.fetch.mockResolvedValue(response(review))
    vi.stubGlobal('fetch', mocks.fetch)
  })

  test('only loads review controls for raw opals', () => {
    mocks.category = 'opal-rings'

    const { container } = render(<AdoptBuilderCandidateButton />)

    expect(container).toBeEmptyDOMElement()
    expect(mocks.fetch).not.toHaveBeenCalled()
  })

  test('shows the source overlay, candidate state, crop, and physical measurements', async () => {
    render(<AdoptBuilderCandidateButton />)

    expect(
      await screen.findByRole('heading', { name: 'Ring builder mapping review' })
    ).toBeDefined()
    expect(screen.getByText('Candidate awaiting approval')).toBeDefined()
    expect(
      screen.getByRole('img', {
        name: /analyzed source image for lightning ridge black opal/i,
      })
    ).toBeDefined()
    expect(screen.getByText(/focus 0.42, 0.57 · zoom 3.40× · rotation -12.0°/i)).toBeDefined()
    expect(screen.getByText(/9 × 6 × 2.5 mm/i)).toBeDefined()
    expect(screen.getByRole('button', { name: 'Apply candidate placement' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Adopt contour + placement' })).not.toBeDisabled()
  })

  test('warns and blocks adoption for a generic fallback with missing measurements', async () => {
    mocks.fetch.mockResolvedValue(
      response({
        ...review,
        candidate: {
          ...review.candidate,
          adoptable: false,
          confidence: 0.7,
          genericFallback: true,
          placementAdoptable: false,
        },
        dimensions: { depth: null, length: 9, width: null },
      })
    )

    render(<AdoptBuilderCandidateButton />)

    expect(await screen.findByText(/generic fallback — manual mapping required/i)).toBeDefined()
    expect(screen.getByText(/do not approve it as the opal’s real outline/i)).toBeDefined()
    expect(screen.getByText(/missing width, depth measurements/i)).toBeDefined()
    expect(screen.getByRole('button', { name: 'Apply candidate placement' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Adopt contour + placement' })).toBeDisabled()
  })

  test('keeps adoption confirmation and reports a successful full mapping update', async () => {
    mocks.fetch
      .mockResolvedValueOnce(response(review))
      .mockResolvedValueOnce(
        response({ message: 'Candidate adopted and enabled in the ring builder.' })
      )
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<AdoptBuilderCandidateButton />)
    const button = await screen.findByRole('button', { name: 'Adopt contour + placement' })

    fireEvent.click(button)

    await waitFor(() =>
      expect(screen.getByRole('status').textContent).toContain(
        'Candidate adopted and enabled in the ring builder.'
      )
    )
    expect(confirm).toHaveBeenCalledWith(
      'Adopt this analyzed contour and image placement as the protected builder mapping?'
    )
    expect(mocks.fetch).toHaveBeenLastCalledWith('/api/admin/products/42/adopt-builder-candidate', {
      method: 'POST',
    })
    expect(button).toBeDisabled()
  })

  test('offers retry after review data fails to load', async () => {
    mocks.fetch.mockResolvedValueOnce(response({ error: 'Administrator access required.' }, false))
    render(<AdoptBuilderCandidateButton />)

    expect(await screen.findByRole('alert')).toHaveTextContent('Administrator access required.')
    mocks.fetch.mockResolvedValueOnce(response(review))
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('heading', { name: 'Ring builder mapping review' })
    ).toBeDefined()
    expect(mocks.fetch).toHaveBeenCalledTimes(2)
  })
})
