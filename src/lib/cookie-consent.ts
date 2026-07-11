export interface CookiePreferences {
  necessary: true
  analytics: boolean
}

export const necessaryCookiePreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
}

export const allCookiePreferences: CookiePreferences = {
  necessary: true,
  analytics: true,
}

export function parseCookiePreferences(value: string | null): CookiePreferences | null {
  if (!value) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || !('analytics' in parsed)) return null

    return {
      necessary: true,
      analytics: parsed.analytics === true,
    }
  } catch {
    return null
  }
}
