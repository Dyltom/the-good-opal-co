import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  instagramReferenceUrls,
  ringDesignInstagramReferences,
} from '../../../migrations/20260714_231500_ring_design_instagram_provenance'

const mocks = vi.hoisted(() => ({ getPayload: vi.fn() }))
vi.mock('@/lib/payload', () => ({ getPayload: mocks.getPayload }))

import {
  auditInstagramReferences,
  classifyInstagramReferenceStatus,
  createInstagramReferenceCheckKey,
  hiddenInstagramRingCandidate,
  instagramReferenceAuditConcurrency,
  instagramReferenceAuditTimeoutMs,
  parseInstagramReferenceUrl,
  type InstagramReferenceCheckData,
  type InstagramReferenceFetch,
  type RingReferenceAuditPayload,
} from '../instagram-reference-audit'

function response(status: number, location?: string): Response {
  return new Response(null, {
    headers: location ? { location } : undefined,
    status,
  })
}

function createPayloadHarness(designs: readonly unknown[] = []) {
  const records = new Map<string, InstagramReferenceCheckData>()
  const find: RingReferenceAuditPayload['find'] = vi.fn(async (args) => {
    if (args.collection === 'ring-designs') return { docs: designs }
    return {
      docs: records.has(args.where.checkKey.equals)
        ? [records.get(args.where.checkKey.equals)]
        : [],
    }
  })
  const create: RingReferenceAuditPayload['create'] = vi.fn(async (args) => {
    records.set(args.data.checkKey, args.data)
    return args.data
  })
  const payload = { create, find } satisfies RingReferenceAuditPayload

  return { create, find, payload, records }
}

function design(id: number, sourceReferences: readonly unknown[]): unknown {
  return { id, sourceReferences }
}

describe('Instagram ring reference audit', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  test('discovers every current ring reference plus the hidden candidate at runtime', async () => {
    const designs = Object.values(ringDesignInstagramReferences).map((references, index) =>
      design(index + 1, references)
    )
    const { payload } = createPayloadHarness(designs)
    const requestedUrls: string[] = []
    const fetchImpl = vi.fn<InstagramReferenceFetch>(async (url) => {
      requestedUrls.push(url)
      return response(200)
    })

    await expect(
      auditInstagramReferences({ fetchImpl, payload, timer: () => 10 })
    ).resolves.toEqual({
      available: 11,
      checked: 11,
      failed: 0,
      recorded: 11,
      redirected: 0,
      skipped: 0,
    })
    expect(new Set(requestedUrls)).toEqual(
      new Set([...instagramReferenceUrls, hiddenInstagramRingCandidate.sourceUrl])
    )
  })

  test('keeps the separate candidate identity exactly aligned with its governed manifest', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), 'docs/ring-design-candidates.json'), 'utf8')
    ) as { candidates: Array<{ id: string; sourceUrl: string }> }

    expect(hiddenInstagramRingCandidate).toEqual({
      candidateKey: manifest.candidates[0]?.id,
      sourceUrl: manifest.candidates[0]?.sourceUrl,
    })
  })

  test('accepts only canonical owned Instagram post and reel routes', () => {
    expect(
      parseInstagramReferenceUrl(
        'https://www.instagram.com/thegoodopalco/p/CXVzSq6vPS-/'
      )
    ).toEqual({
      accountHandle: '@thegoodopalco',
      canonicalUrl: 'https://www.instagram.com/thegoodopalco/p/CXVzSq6vPS-/',
      contentType: 'p',
      shortcode: 'CXVzSq6vPS-',
    })
    expect(
      parseInstagramReferenceUrl('https://www.instagram.com/goodopalco/reel/DDRWMlQyOtA/')
    ).toMatchObject({
      accountHandle: '@goodopalco',
      contentType: 'reel',
      shortcode: 'DDRWMlQyOtA',
    })

    for (const invalid of [
      'http://www.instagram.com/thegoodopalco/p/example/',
      'https://instagram.com/thegoodopalco/p/example/',
      'https://www.instagram.com.evil.example/thegoodopalco/p/example/',
      'https://user:secret@www.instagram.com/thegoodopalco/p/example/',
      'https://www.instagram.com:444/thegoodopalco/p/example/',
      'https://www.instagram.com/thegoodopalco/p/example',
      'https://www.instagram.com/thegoodopalco/p/example/?token=secret',
      'https://www.instagram.com/thegoodopalco/p/example/#slide-2',
      'https://www.instagram.com/accounts/login/',
      'https://www.instagram.com/thegoodopalco/stories/example/',
    ]) {
      expect(parseInstagramReferenceUrl(invalid)).toBeNull()
    }
  })

  test.each([
    [200, 'available'],
    [204, 'available'],
    [301, 'redirected'],
    [399, 'redirected'],
    [401, 'blocked'],
    [403, 'blocked'],
    [404, 'not-found'],
    [429, 'rate-limited'],
    [418, 'error'],
    [500, 'error'],
  ] as const)('classifies HTTP %i as %s', (httpStatus, expected) => {
    expect(classifyInstagramReferenceStatus(httpStatus)).toBe(expected)
  })

  test('persists sanitized route metadata with the required access context', async () => {
    const { create, find, payload } = createPayloadHarness()
    const fetchImpl = vi.fn<InstagramReferenceFetch>().mockResolvedValue(
      response(302, 'https://www.instagram.com/thegoodopalco/p/CXnomebPrtC/')
    )
    const timer = vi.fn().mockReturnValueOnce(100).mockReturnValueOnce(112.4)

    await expect(
      auditInstagramReferences({
        fetchImpl,
        now: () => new Date('2026-07-15T01:02:03.000Z'),
        payload,
        timer,
      })
    ).resolves.toEqual({
      available: 0,
      checked: 1,
      failed: 0,
      recorded: 1,
      redirected: 1,
      skipped: 0,
    })
    expect(fetchImpl).toHaveBeenCalledWith(hiddenInstagramRingCandidate.sourceUrl, {
      cache: 'no-store',
      method: 'GET',
      redirect: 'manual',
      signal: expect.any(AbortSignal),
    })
    expect(find).toHaveBeenCalledWith({
      collection: 'ring-reference-checks',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: {
        checkKey: {
          equals:
            'instagram:2026-07-15:candidate:unnamed-pear-clean-bezel-2023:thegoodopalco:p:CtEHPylykK3',
        },
      },
    })
    expect(create).toHaveBeenCalledWith({
      collection: 'ring-reference-checks',
      context: { ringReferenceAudit: true },
      data: {
        accountHandle: '@thegoodopalco',
        candidateKey: 'unnamed-pear-clean-bezel-2023',
        checkedAt: '2026-07-15T01:02:03.000Z',
        checkKey:
          'instagram:2026-07-15:candidate:unnamed-pear-clean-bezel-2023:thegoodopalco:p:CtEHPylykK3',
        durationMs: 12,
        httpStatus: 302,
        outcome: 'redirected',
        resolvedUrl: 'https://www.instagram.com/thegoodopalco/p/CXnomebPrtC/',
        shortcode: 'CtEHPylykK3',
        sourceUrl: hiddenInstagramRingCandidate.sourceUrl,
      },
      overrideAccess: true,
    })
  })

  test('drops untrusted redirect locations and never persists response content', async () => {
    const { create, payload } = createPayloadHarness()
    const headers = { get: vi.fn(() => 'https://evil.example/steal?token=secret') }
    const fetchImpl = vi.fn<InstagramReferenceFetch>().mockResolvedValue({ headers, status: 301 })

    await auditInstagramReferences({ fetchImpl, payload, timer: () => 0 })

    const data = create.mock.calls[0]?.[0].data
    expect(data).not.toHaveProperty('resolvedUrl')
    expect(data).not.toHaveProperty('body')
    expect(data).not.toHaveProperty('credentials')
    expect(JSON.stringify(data)).not.toContain('evil.example')
    expect(headers.get).toHaveBeenCalledTimes(1)
    expect(headers.get).toHaveBeenCalledWith('location')
  })

  test('records request failures without exception messages or response bodies', async () => {
    const { create, payload } = createPayloadHarness()
    const fetchImpl = vi
      .fn<InstagramReferenceFetch>()
      .mockRejectedValue(new Error('secret upstream diagnostics'))

    await expect(
      auditInstagramReferences({ fetchImpl, payload, timer: () => 0 })
    ).resolves.toMatchObject({ checked: 1, failed: 1, recorded: 1 })
    const data = create.mock.calls[0]?.[0].data
    expect(data).not.toHaveProperty('httpStatus')
    expect(data?.outcome).toBe('error')
    expect(JSON.stringify(data)).not.toContain('secret')
  })

  test('uses a daily UTC key and skips checks already persisted that day', async () => {
    const { create, payload } = createPayloadHarness()
    const fetchImpl = vi.fn<InstagramReferenceFetch>().mockResolvedValue(response(200))
    const now = () => new Date('2026-07-14T23:30:00-02:00')

    const first = await auditInstagramReferences({ fetchImpl, now, payload, timer: () => 0 })
    const second = await auditInstagramReferences({ fetchImpl, now, payload, timer: () => 0 })

    expect(first).toMatchObject({ available: 1, checked: 1, recorded: 1, skipped: 0 })
    expect(second).toEqual({
      available: 0,
      checked: 0,
      failed: 0,
      recorded: 0,
      redirected: 0,
      skipped: 1,
    })
    expect(create.mock.calls[0]?.[0].data.checkKey).toContain('instagram:2026-07-15:')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  test('aborts a request at the configured ten-second boundary', async () => {
    vi.useFakeTimers()
    const { payload } = createPayloadHarness()
    const fetchImpl = vi.fn<InstagramReferenceFetch>().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted')))
        })
    )

    const audit = auditInstagramReferences({ fetchImpl, payload, timer: () => 0 })
    await vi.advanceTimersByTimeAsync(instagramReferenceAuditTimeoutMs - 1)
    expect(fetchImpl.mock.calls[0]?.[1].signal.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(1)

    await expect(audit).resolves.toMatchObject({ checked: 1, failed: 1 })
    expect(fetchImpl.mock.calls[0]?.[1].signal.aborted).toBe(true)
  })

  test('never exceeds the bounded request concurrency', async () => {
    const designs = Object.values(ringDesignInstagramReferences).map((references, index) =>
      design(index + 1, references)
    )
    const { payload } = createPayloadHarness(designs)
    let active = 0
    let maximumActive = 0
    const fetchImpl = vi.fn<InstagramReferenceFetch>().mockImplementation(async () => {
      active += 1
      maximumActive = Math.max(maximumActive, active)
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 2))
      active -= 1
      return response(200)
    })

    await auditInstagramReferences({ fetchImpl, payload, timer: () => 0 })

    expect(maximumActive).toBe(instagramReferenceAuditConcurrency)
  })

  test('queries live references and works with the default Payload dependency', async () => {
    const reference = ringDesignInstagramReferences.aurora[0]
    const { find, payload } = createPayloadHarness([design(42, [reference])])
    mocks.getPayload.mockResolvedValue(payload)
    vi.stubGlobal('fetch', vi.fn<InstagramReferenceFetch>().mockResolvedValue(response(200)))

    await expect(auditInstagramReferences({ timer: () => 0 })).resolves.toMatchObject({
      available: 2,
      checked: 2,
    })
    expect(mocks.getPayload).toHaveBeenCalledOnce()
    expect(find).toHaveBeenCalledWith({
      collection: 'ring-designs',
      depth: 0,
      limit: 1_000,
      overrideAccess: true,
      pagination: false,
    })
  })

  test('ignores malformed, non-Instagram, and duplicate live references', async () => {
    const instagram = ringDesignInstagramReferences.gemini[0]
    const productReference = {
      assetPath: '/product.jpg',
      sourceType: 'product-gallery',
      sourceUrl: 'https://goodopalco.com/product/ring',
      view: 'top',
    }
    const malformedInstagram = { ...instagram, sourceUrl: 'https://instagram.com/p/example/' }
    const { payload } = createPayloadHarness([
      design(7, [instagram, instagram, productReference, malformedInstagram, null]),
    ])
    const fetchImpl = vi.fn<InstagramReferenceFetch>().mockResolvedValue(response(200))

    await auditInstagramReferences({ fetchImpl, payload, timer: () => 0 })

    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(fetchImpl).toHaveBeenCalledWith(instagram.sourceUrl, expect.any(Object))
    expect(fetchImpl).toHaveBeenCalledWith(
      hiddenInstagramRingCandidate.sourceUrl,
      expect.any(Object)
    )
  })

  test('builds target-specific UTC check keys without locale date handling', () => {
    const parsed = parseInstagramReferenceUrl(hiddenInstagramRingCandidate.sourceUrl)
    expect(parsed).not.toBeNull()
    if (!parsed) return

    expect(
      createInstagramReferenceCheckKey(new Date('2026-12-31T23:59:59.999Z'), {
        candidateKey: hiddenInstagramRingCandidate.candidateKey,
        parsed,
      })
    ).toBe(
      'instagram:2026-12-31:candidate:unnamed-pear-clean-bezel-2023:thegoodopalco:p:CtEHPylykK3'
    )
  })
})
