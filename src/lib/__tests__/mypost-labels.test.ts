import { describe, expect, it } from 'vitest'
import { MYPOST_HEADERS, buildMyPostCsv } from '../mypost-labels'

type Input = Parameters<typeof buildMyPostCsv>[0][number]

function order(overrides: Partial<Input> = {}): Input {
  return {
    orderNumber: 'OPAL-1',
    status: 'processing',
    total: 80,
    customer: { email: 'jo@example.com', name: 'Jo Citizen', phone: '+61 412 345 678' },
    shippingAddress: {
      line1: '1 Main St',
      city: 'Cowra',
      state: 'NSW',
      postalCode: '2794',
      country: 'AU',
    },
    ...overrides,
  }
}

function parse(csv: string) {
  const [, ...rows] = csv.trim().split('\r\n')
  return rows.map((line) => {
    const cells = line.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g) ?? []
    const values = cells.slice(0, MYPOST_HEADERS.length).map((c) => {
      const raw = c.replace(/,$/, '')
      return raw.startsWith('"') ? raw.slice(1, -1).replace(/""/g, '"') : raw
    })
    return Object.fromEntries(MYPOST_HEADERS.map((h, i) => [h, values[i]]))
  })
}

describe('MyPost labels CSV', () => {
  it('starts with the Australia Post template header row', () => {
    expect(buildMyPostCsv([]).split('\r\n')[0]).toBe(MYPOST_HEADERS.join(','))
  })

  it('adds Extra Cover for the full rounded-up total and signature only over $100', () => {
    const [big, small] = parse(
      buildMyPostCsv([
        order({ orderNumber: 'OPAL-BIG', total: 250.4 }),
        order({ orderNumber: 'OPAL-SMALL', total: 99 }),
      ])
    )
    expect(big).toMatchObject({
      'Additional Label Information 1': 'OPAL-BIG',
      'Extra Cover Amount': '251',
      'Signature On Delivery': 'YES',
    })
    expect(small).toMatchObject({ 'Extra Cover Amount': '', 'Signature On Delivery': 'NO' })
  })

  it('caps Extra Cover at 5000', () => {
    expect(parse(buildMyPostCsv([order({ total: 7200 })]))[0]?.['Extra Cover Amount']).toBe('5000')
  })

  it('exports only paid, unshipped Australian orders', () => {
    const rows = parse(
      buildMyPostCsv([
        order({ orderNumber: 'OPAL-PAID' }),
        order({ orderNumber: 'OPAL-SHIPPED', status: 'shipped' }),
        order({ orderNumber: 'OPAL-PENDING', status: 'pending' }),
        order({
          orderNumber: 'OPAL-NZ',
          shippingAddress: { line1: '2 Queen St', city: 'Auckland', country: 'NZ' },
        }),
      ])
    )
    expect(rows.map((r) => r['Additional Label Information 1'])).toEqual(['OPAL-PAID'])
  })

  it('escapes commas, quotes and newlines and keeps the template limits', () => {
    const [row] = parse(
      buildMyPostCsv([
        order({
          customer: { email: 'a@b.co', name: 'Smith, "Jo"', phone: null },
          shippingAddress: {
            line1: 'Unit 4, 12 Long Road\nRear',
            city: 'Cowra',
            state: 'NSW',
            postalCode: '2794',
            country: 'AU',
          },
        }),
        order({ customer: { email: 'a@b.co', name: 'X'.repeat(50) } }),
      ])
    )
    expect(row).toMatchObject({
      'Deliver To Name': 'Smith, "Jo"',
      'Deliver To Address Line 1': 'Unit 4, 12 Long Road\nRear',
    })
    expect(
      buildMyPostCsv([order({ customer: { email: 'a@b.co', name: 'X'.repeat(50) } })])
    ).toContain(',' + 'X'.repeat(35) + ',')
  })
})
