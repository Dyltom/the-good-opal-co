import { describe, expect, test } from 'vitest'
import {
  allCookiePreferences,
  necessaryCookiePreferences,
  parseCookiePreferences,
} from '../cookie-consent'

describe('cookie consent preferences', () => {
  test('parses the current analytics choice', () => {
    expect(parseCookiePreferences(JSON.stringify(allCookiePreferences))).toEqual({
      necessary: true,
      analytics: true,
    })
  })

  test('keeps older consent records compatible while dropping unused categories', () => {
    expect(
      parseCookiePreferences(
        JSON.stringify({ necessary: false, analytics: false, marketing: true, preferences: true })
      )
    ).toEqual(necessaryCookiePreferences)
  })

  test.each([null, '', 'not-json', '{}', '[]'])('rejects invalid stored value %s', (value) => {
    expect(parseCookiePreferences(value)).toBeNull()
  })
})
