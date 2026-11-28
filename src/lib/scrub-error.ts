function rawErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (!(error instanceof Error)) return 'Unknown error'
  return error.cause instanceof Error && error.cause.message
    ? `${error.cause.message} | ${error.message}`
    : error.message
}

export function scrubSecrets(raw: string): string {
  return raw
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, '[email]')
    .replace(/\b[a-z][a-z0-9+.-]*:\/\/\S+/gi, '[url]')
    .replace(/\b(sk|pk|rk|whsec|re)_[A-Za-z0-9_]+/g, '[key]')
    .replace(/(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]{24,}/g, '[token]')
}

export function scrubErrorMessage(error: unknown): string {
  return (
    scrubSecrets(rawErrorMessage(error))
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300) || 'No message'
  )
}
