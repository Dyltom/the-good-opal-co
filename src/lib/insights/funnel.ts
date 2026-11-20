export interface FunnelCounts {
  visitors: number
  productViews: number
  carts: number
  checkouts: number
  purchases: number
}

export interface FunnelStep {
  label: string
  visitors: number
  shareOfStart: number
  dropOff: number
}

const FUNNEL_LABELS: [keyof FunnelCounts, string][] = [
  ['visitors', 'Visited'],
  ['productViews', 'Viewed a piece'],
  ['carts', 'Added to cart'],
  ['checkouts', 'Started checkout'],
  ['purchases', 'Paid'],
]

export function ratio(part: number, whole: number): number {
  return whole > 0 ? Math.min(1, Math.max(0, part / whole)) : 0
}

export function buildFunnel(counts: FunnelCounts): FunnelStep[] {
  return FUNNEL_LABELS.map(([key, label], index) => {
    const previousKey = FUNNEL_LABELS[index - 1]?.[0]
    const previous = previousKey ? counts[previousKey] : counts[key]
    return {
      label,
      visitors: counts[key],
      shareOfStart: ratio(counts[key], counts.visitors),
      dropOff: previousKey ? 1 - ratio(counts[key], previous) : 0,
    }
  })
}
