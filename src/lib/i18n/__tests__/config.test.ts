import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE } from '@/lib/constants'
import {
  getLanguageAlternates,
  getTextDirection,
  isSupportedLocale,
  negotiateLocale,
  resolveLocale,
  translate,
} from '@/lib/i18n'

describe('locale configuration', () => {
  it('normalizes reviewed locale codes and path aliases', () => {
    expect(isSupportedLocale('en-AU')).toBe(true)
    expect(isSupportedLocale('en_au')).toBe(true)
    expect(isSupportedLocale('en-au')).toBe(true)
    expect(isSupportedLocale('fr-FR')).toBe(false)
    expect(resolveLocale('en-GB')).toBe(DEFAULT_LOCALE)
  })

  it('negotiates by quality and safely falls back to reviewed content', () => {
    expect(negotiateLocale('fr-FR;q=0.9, en-GB;q=0.8')).toBe(DEFAULT_LOCALE)
    expect(negotiateLocale('ar;q=1, *;q=0.5')).toBe(DEFAULT_LOCALE)
    expect(negotiateLocale(null)).toBe(DEFAULT_LOCALE)
  })

  it('detects RTL scripts without claiming those translations are available', () => {
    expect(getTextDirection('ar-SA')).toBe('rtl')
    expect(getTextDirection('he-IL')).toBe('rtl')
    expect(getTextDirection(DEFAULT_LOCALE)).toBe('ltr')
  })

  it('builds canonical language and x-default alternates', () => {
    expect(getLanguageAlternates('store')).toEqual({
      'en-AU': '/store',
      'x-default': '/store',
    })
  })

  it('serves the reviewed catalogue and interpolates values', () => {
    expect(translate('en-AU', 'locale.label')).toBe('Language')
    expect(translate('fr-FR', 'locale.label')).toBe('Language')
  })
})
