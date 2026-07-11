export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // Relative application URLs are already safe to use.
  }

  return url
}
