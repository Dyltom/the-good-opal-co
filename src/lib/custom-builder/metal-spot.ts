import { get } from 'node:https'
import { priceSheetSpot, type MetalSpot } from './pricing'

const spotUrl = (symbol: 'XAU' | 'XAG') => `https://api.gold-api.com/price/${symbol}/AUD`
const resolveIpv4Only = { family: 4 } as const
const maxAgeMs = 60 * 60 * 1000

let cached: { spot: MetalSpot; fetchedAt: number } | undefined

function getJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const request = get(url, { ...resolveIpv4Only, timeout: 3000 }, (response) => {
      if (response.statusCode !== 200) {
        response.resume()
        reject(new Error(`${url} returned ${response.statusCode}`))
        return
      }
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk: string) => (body += chunk))
      response.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(error)
        }
      })
    })
    request.on('timeout', () => request.destroy(new Error(`${url} timed out`)))
    request.on('error', reject)
  })
}

async function fetchAudPerOz(symbol: 'XAU' | 'XAG', reference: number) {
  const body = (await getJson(spotUrl(symbol))) as { price?: unknown; updatedAt?: unknown }
  const price = body.price
  if (typeof price !== 'number' || !(price > reference * 0.5 && price < reference * 2)) {
    throw new Error(`${symbol} spot price ${String(price)} is outside the expected range`)
  }
  return { price, updatedAt: typeof body.updatedAt === 'string' ? body.updatedAt : undefined }
}

export async function getMetalSpot(): Promise<MetalSpot> {
  if (cached && Date.now() - cached.fetchedAt < maxAgeMs) return cached.spot
  try {
    const [gold, silver] = await Promise.all([
      fetchAudPerOz('XAU', priceSheetSpot.goldAudPerOz),
      fetchAudPerOz('XAG', priceSheetSpot.silverAudPerOz),
    ])
    const spot = {
      goldAudPerOz: gold.price,
      silverAudPerOz: silver.price,
      asOf: gold.updatedAt ?? new Date().toISOString(),
      live: true,
    }
    cached = { spot, fetchedAt: Date.now() }
    return spot
  } catch (error) {
    console.warn('Live metal prices unavailable; using the price sheet reference', error)
    return priceSheetSpot
  }
}
