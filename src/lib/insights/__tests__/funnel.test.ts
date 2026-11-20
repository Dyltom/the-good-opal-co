import { describe, expect, it } from 'vitest'
import { buildFunnel } from '../funnel'

describe('buildFunnel', () => {
  it('reports each step as a share of visitors and the drop from the step before', () => {
    const steps = buildFunnel({ visitors: 200, productViews: 120, carts: 30, checkouts: 12, purchases: 3 })

    expect(steps.map((step) => [step.label, step.visitors])).toEqual([
      ['Visited', 200],
      ['Viewed a piece', 120],
      ['Added to cart', 30],
      ['Started checkout', 12],
      ['Paid', 3],
    ])
    expect(steps[1]).toMatchObject({ shareOfStart: 0.6, dropOff: 0.4 })
    expect(steps[2]).toMatchObject({ shareOfStart: 0.15, dropOff: 0.75 })
    expect(steps[4]).toMatchObject({ shareOfStart: 0.015, dropOff: 0.75 })
  })

  it('shows no drop when nobody visited instead of dividing by zero', () => {
    const steps = buildFunnel({ visitors: 0, productViews: 0, carts: 0, checkouts: 0, purchases: 0 })

    for (const step of steps) {
      expect(step.shareOfStart).toBe(0)
      expect(Number.isFinite(step.dropOff)).toBe(true)
    }
  })

  it('never reports a negative drop when a later step outnumbers the one before it', () => {
    const steps = buildFunnel({ visitors: 10, productViews: 4, carts: 6, checkouts: 6, purchases: 1 })

    expect(steps[2]).toMatchObject({ visitors: 6, dropOff: 0 })
    expect(steps.every((step) => step.shareOfStart <= 1 && step.dropOff >= 0)).toBe(true)
  })
})
