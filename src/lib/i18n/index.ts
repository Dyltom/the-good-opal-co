import { enAU } from './catalogs/en-AU'
import { resolveLocale, type SupportedLocale } from './config'

const catalogues = {
  'en-AU': enAU,
} as const satisfies Record<SupportedLocale, Record<string, string>>

export type TranslationKey = keyof typeof enAU
export type TranslationValues = Record<string, string | number>

export function translate(
  locale: string | null | undefined,
  key: TranslationKey,
  values: TranslationValues = {}
): string {
  const resolvedLocale = resolveLocale(locale)
  const template = catalogues[resolvedLocale][key] ?? enAU[key]
  let message: string = template

  for (const [name, value] of Object.entries(values)) {
    message = message.replaceAll(`{${name}}`, String(value))
  }

  return message
}

export * from './config'
