import { priceSheetSpot, type MetalSpot } from './pricing'

const spotUrl = (symbol: 'XAU' | 'XAG') => `https://api.gold-api.com/price/${symbol}/AUD`

async function fetchAudPerOz(symbol: 'XAU' | 'XAG', reference: number) {
  const response = await fetch(spotUrl(symbol), {
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(3000),
  })
  if (!response.ok) throw new Error(`${symbol} spot request failed with ${response.status}`)
  const body = (await response.json()) as { price?: unknown; updatedAt?: unknown }
  const price = body.price
  if (typeof price !== 'number' || !(price > reference * 0.5 && price < reference * 2)) {
    throw new Error(`${symbol} spot price ${String(price)} is outside the expected range`)
  }
  return { price, updatedAt: typeof body.updatedAt === 'string' ? body.updatedAt : undefined }
}

export async function getMetalSpot(): Promise<MetalSpot> {
  try {
    const [gold, silver] = await Promise.all([
      fetchAudPerOz('XAU', priceSheetSpot.goldAudPerOz),
      fetchAudPerOz('XAG', priceSheetSpot.silverAudPerOz),
    ])
    return {
      goldAudPerOz: gold.price,
      silverAudPerOz: silver.price,
      asOf: gold.updatedAt ?? new Date().toISOString(),
      live: true,
    }
  } catch (error) {
    console.warn('Live metal prices unavailable; using the price sheet reference', error)
    return priceSheetSpot
  }
}
