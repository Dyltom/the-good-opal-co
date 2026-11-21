import { APP_URL } from '../lib/constants'
import { indexNowPayload, submitToIndexNow } from '../lib/indexnow'

const dryRun = process.argv.includes('--dry-run')
const sitemapUrl = `${APP_URL}/sitemap.xml`
const response = await fetch(sitemapUrl)
if (!response.ok) throw new Error(`Could not read ${sitemapUrl}: ${response.status}`)

const urls = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) =>
  loc!.replace(/&amp;/g, '&')
)
const payload = indexNowPayload(urls)
if (!payload) throw new Error(`No https URLs on ${APP_URL} to submit`)

if (dryRun) {
  console.log(JSON.stringify(payload, null, 2))
} else {
  const status = await submitToIndexNow(payload)
  console.log(`IndexNow answered ${status} for ${payload.urlList.length} URLs`)
  if (status !== 200 && status !== 202) process.exitCode = 1
}
