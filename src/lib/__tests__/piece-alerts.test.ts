import { beforeEach, describe, expect, it, vi } from 'vitest'

const m = vi.hoisted(() => ({
  send: vi.fn(),
  find: vi.fn(),
  created: [] as Record<string, unknown>[],
  audits: [] as Record<string, unknown>[],
  updated: [] as Record<string, unknown>[],
  customers: [] as Record<string, unknown>[],
}))

vi.mock('resend', () => ({
  Resend: class ResendMock {
    emails = { send: m.send }
  },
}))
vi.mock('@/lib/payload', () => ({ getPayload: async () => ({ find: m.find }) }))

import { sendPieceAlerts } from '../piece-alerts'

const now = new Date('2026-11-27T11:30:00Z')

function product(id: number, category: string) {
  return { id, name: `Piece ${id}`, slug: `piece-${id}`, category, price: 300, stock: 1, createdAt: '2026-11-27T01:00:00Z' }
}

function customer(id: number, tags: string[], extra: Record<string, unknown> = {}) {
  return {
    id,
    email: `c${id}@example.com`,
    subscribedToNewsletter: true,
    emailVerified: true,
    tags: tags.map((tag) => ({ tag })),
    ...extra,
  }
}

describe('piece alerts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://goodopalco.com')
    vi.stubEnv('PAYLOAD_SECRET', 'secret')
    m.created = [product(1, 'opal-rings'), product(2, 'opal-rings')]
    m.audits = []
    m.updated = []
    m.customers = []
    m.send.mockResolvedValue({ data: { id: 'email' }, error: null })
    m.find.mockImplementation(async ({ collection, where }: { collection: string; where: unknown }) => {
      if (collection === 'audit-events') return { docs: m.audits }
      if (collection === 'customers') return { docs: m.customers }
      return { docs: JSON.stringify(where).includes('"in"') ? m.updated : m.created }
    })
  })

  it('emails only consented, verified, still-subscribed customers whose alert matches a new piece, once each', async () => {
    m.customers = [
      customer(10, ['alert:opal-rings']),
      customer(11, ['alert:opal-earrings']),
      customer(12, ['alert:opal-rings', 'unsubscribed']),
      customer(13, ['alert:opal-rings'], { emailVerified: false }),
      customer(14, ['alert:opal-rings'], { subscribedToNewsletter: false }),
    ]

    expect(await sendPieceAlerts(now)).toEqual({ piecesFound: 2, sent: 1, failed: 0 })
    expect(m.send).toHaveBeenCalledTimes(1)
    const [message, options] = m.send.mock.calls[0]!
    expect(message.to).toBe('c10@example.com')
    expect(message.subject).toBe('New rings just came in')
    expect(message.headers['List-Unsubscribe']).toContain('/newsletter/unsubscribe?token=')
    expect(options).toEqual({ idempotencyKey: 'piece-alert/10/2026-11-27' })
  })

  it('counts a piece put back in stock from the activity log, and ignores unrelated edits', async () => {
    m.created = []
    m.audits = [
      { documentId: '5', changes: [{ path: 'stock', before: 0, after: 1 }] },
      { documentId: '6', changes: [{ path: 'price', before: 100, after: 120 }] },
    ]
    m.updated = [product(5, 'opal-earrings')]
    m.customers = [customer(11, ['alert:opal-earrings'])]

    expect(await sendPieceAlerts(now)).toEqual({ piecesFound: 1, sent: 1, failed: 0 })
    const productQuery = m.find.mock.calls.find(([args]) => JSON.stringify(args.where).includes('"in"'))
    expect(JSON.stringify(productQuery![0].where)).toContain('["5"]')
    expect(m.send.mock.calls[0]![0].subject).toBe('A new earring just came in')
  })

  it('keeps sending to others when one email fails', async () => {
    m.customers = [customer(10, ['alert:opal-rings']), customer(15, ['alert:opal-rings'])]
    m.send.mockResolvedValueOnce({ data: null, error: { message: 'bounced' } })

    expect(await sendPieceAlerts(now)).toEqual({ piecesFound: 2, sent: 1, failed: 1 })
  })
})
