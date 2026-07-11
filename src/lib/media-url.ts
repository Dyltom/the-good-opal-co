const catalogueMediaCorrections: Record<string, string> = {
  // Woo product 5504 replaced its primary after the original export was created.
  'IMG_0810.jpg': '/images/products/IMG_0808.jpg',
}

function correctedCatalogueMedia(pathname: string): string | undefined {
  const filename = pathname.split('/').at(-1)
  return filename ? catalogueMediaCorrections[filename] : undefined
}

export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    const correction = correctedCatalogueMedia(parsed.pathname)
    if (correction) return correction

    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.pathname.startsWith('/api/media/file/')
    ) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // Relative application URLs are already safe to use.
    const correction = correctedCatalogueMedia(url.split('?')[0] ?? '')
    if (correction) return correction
  }

  return url
}
