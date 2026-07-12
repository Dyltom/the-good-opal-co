import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/lib/constants'

/**
 * Only publish locales whose complete customer-facing content has been reviewed.
 * Adding a locale here is the final step after its catalogue, CMS content, legal
 * copy, email templates, and commerce flow have all been approved.
 */
export const SUPPORTED_LOCALES = [
  {
    code: DEFAULT_LOCALE,
    path: 'en-au',
    label: 'English (Australia)',
    language: 'English',
    direction: 'ltr',
    currency: DEFAULT_CURRENCY,
  },
] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]['code']
export type TextDirection = 'ltr' | 'rtl'

const RTL_LANGUAGES = new Set(['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'sd', 'ug', 'ur', 'yi'])

function normalizeLocale(value: string): string {
  return value.trim().replaceAll('_', '-').toLowerCase()
}

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  if (!value) return false
  const normalized = normalizeLocale(value)

  return SUPPORTED_LOCALES.some(
    (locale) =>
      normalizeLocale(locale.code) === normalized || normalizeLocale(locale.path) === normalized
  )
}

export function resolveLocale(value: string | null | undefined): SupportedLocale {
  if (!value) return DEFAULT_LOCALE
  const normalized = normalizeLocale(value)
  const exact = SUPPORTED_LOCALES.find(
    (locale) =>
      normalizeLocale(locale.code) === normalized || normalizeLocale(locale.path) === normalized
  )
  if (exact) return exact.code

  const language = normalized.split('-')[0]
  const languageMatch = SUPPORTED_LOCALES.find(
    (locale) => normalizeLocale(locale.code).split('-')[0] === language
  )

  return languageMatch?.code ?? DEFAULT_LOCALE
}

export function negotiateLocale(acceptLanguage: string | null | undefined): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  const preferences = acceptLanguage
    .split(',')
    .map((entry, index) => {
      const [tag = '', ...parameters] = entry.trim().split(';')
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith('q='))
      const quality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1

      return {
        tag,
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      }
    })
    .filter(({ tag, quality }) => tag !== '*' && tag.length > 0 && quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index)

  for (const preference of preferences) {
    if (isSupportedLocale(preference.tag)) return resolveLocale(preference.tag)

    const language = normalizeLocale(preference.tag).split('-')[0]
    const match = SUPPORTED_LOCALES.find(
      (locale) => normalizeLocale(locale.code).split('-')[0] === language
    )
    if (match) return match.code
  }

  return DEFAULT_LOCALE
}

export function getTextDirection(locale: string): TextDirection {
  const language = normalizeLocale(locale).split('-')[0]
  return language && RTL_LANGUAGES.has(language) ? 'rtl' : 'ltr'
}

export function getLocaleConfig(locale: string | null | undefined) {
  const resolved = resolveLocale(locale)
  return SUPPORTED_LOCALES.find((item) => item.code === resolved) ?? SUPPORTED_LOCALES[0]
}

export function getLanguageAlternates(pathname = '/'): Record<string, string> {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  return {
    [DEFAULT_LOCALE]: normalizedPath,
    'x-default': normalizedPath,
  }
}
