import { afterEach, describe, expect, test } from 'vitest'
import { googleTagScript } from '../GoogleTag'

function runTag(): unknown[][] {
  new Function(googleTagScript('G-TEST'))()
  return (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>))
}

describe('Google tag', () => {
  afterEach(() => {
    window.dataLayer = undefined
    window.gtag = undefined
    window.localStorage.clear()
    window.history.replaceState(null, '', '/')
    document.head.innerHTML = ''
  })

  test('queues events from the first render so a purchase is not lost before gtag.js loads', () => {
    const calls = runTag()
    window.gtag?.('event', 'purchase', { value: 1 })

    expect(calls[0]).toEqual([
      'consent',
      'default',
      { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' },
    ])
    expect(calls).toContainEqual(['config', 'G-TEST'])
    expect(window.dataLayer?.length).toBe(calls.length + 1)
  })

  test('downloads gtag.js only once the visitor accepts analytics', () => {
    const gtagScript = () => document.querySelector('script[src*="gtag/js?id=G-TEST"]')
    runTag()
    expect(gtagScript()).toBeNull()

    window.localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, analytics: true }))
    window.dispatchEvent(new Event('cookie-consent-updated'))

    expect(gtagScript()).not.toBeNull()
  })

  test('downloads gtag.js straight away for a visitor who accepted earlier', () => {
    window.localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, analytics: true }))
    runTag()

    expect(document.querySelector('script[src*="gtag/js?id=G-TEST"]')).not.toBeNull()
  })

  test('grants analytics and ad measurement, never personalisation, for a visitor who accepted', () => {
    window.localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, analytics: true }))

    expect(runTag()).toContainEqual([
      'consent',
      'update',
      { ad_storage: 'granted', ad_user_data: 'granted', analytics_storage: 'granted' },
    ])
  })

  test('stays off private quote links', () => {
    window.history.replaceState(null, '', '/quote/access')

    expect(runTag()).toEqual([])
    expect(window.gtag).toBeUndefined()
  })
})
