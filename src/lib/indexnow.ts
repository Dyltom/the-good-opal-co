import { after } from 'next/server'
import type { CollectionAfterChangeHook } from 'payload'
import { APP_URL } from './constants'

export const INDEXNOW_KEY = '8e05bebb9bc021015859a850bbe611a0'
export const INDEXNOW_KEY_PATH = '/indexnow-key.txt'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const INDEXNOW_CONTEXT = 'indexNowScheduled'

export interface IndexNowPayload {
  host: string
  key: string
  keyLocation: string
  urlList: string[]
}

export function indexNowPayload(urls: string[], origin: string = APP_URL): IndexNowPayload | null {
  const site = new URL(origin)
  if (site.protocol !== 'https:') return null

  const urlList = [
    ...new Set(
      urls.flatMap((value) => {
        try {
          const url = new URL(value, site)
          return url.host === site.host ? [url.toString()] : []
        } catch {
          return []
        }
      })
    ),
  ].slice(0, 10000)
  if (urlList.length === 0) return null

  return {
    host: site.host,
    key: INDEXNOW_KEY,
    keyLocation: `${site.origin}${INDEXNOW_KEY_PATH}`,
    urlList,
  }
}

export async function submitToIndexNow(payload: IndexNowPayload): Promise<number> {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })
  return response.status
}

export function indexNowOnPublish(
  publicPath: (doc: Record<string, unknown>) => string | null
): CollectionAfterChangeHook {
  return ({ context, doc, req }) => {
    if (process.env.INDEXNOW_ENABLED !== 'true' || context[INDEXNOW_CONTEXT]) return doc
    const path = publicPath(doc)
    const payload = path ? indexNowPayload([path]) : null
    if (!payload) return doc
    context[INDEXNOW_CONTEXT] = true

    const warn = (details: Record<string, unknown>) =>
      req.payload.logger.warn({ msg: 'IndexNow submission failed', urls: payload.urlList, ...details })
    try {
      after(async () => {
        try {
          const status = await submitToIndexNow(payload)
          if (status !== 200 && status !== 202) warn({ status })
        } catch (error: unknown) {
          warn({ error: error instanceof Error ? error.message : 'Unknown IndexNow error' })
        }
      })
    } catch (error: unknown) {
      warn({ error: error instanceof Error ? error.message : 'Unknown scheduler error' })
    }
    return doc
  }
}
