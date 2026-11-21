function collectText(node: unknown, output: string[]): void {
  if (!node || typeof node !== 'object') return

  const record = node as Record<string, unknown>
  if (typeof record['text'] === 'string') output.push(record['text'])

  const children = record['children']
  if (Array.isArray(children)) {
    for (const child of children) collectText(child, output)
  }

  const root = record['root']
  if (root) collectText(root, output)
}

export function extractPlainText(value: unknown): string {
  if (typeof value === 'string') return value.trim()

  const output: string[] = []
  collectText(value, output)
  return output.join(' ').replace(/\s+/g, ' ').trim()
}

const LEGACY_POST_URL = /^https?:\/\/(?:www\.)?goodopalco\.com\/\d{4}\/\d{2}\/\d{2}\/([a-z0-9-]+)\/?$/

function rewriteNode(node: unknown, siteUrl: string): unknown {
  if (Array.isArray(node)) return node.map((child) => rewriteNode(child, siteUrl))
  if (!node || typeof node !== 'object') return node

  const record: Record<string, unknown> = Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, rewriteNode(value, siteUrl)])
  )
  const fields = record['fields']
  if (!fields || typeof fields !== 'object' || !('url' in fields) || typeof fields.url !== 'string') return record

  const slug = LEGACY_POST_URL.exec(fields.url)?.[1]
  if (!slug) return record

  const legacyUrl = fields.url
  const path = `/blog/${slug}`
  const children = Array.isArray(record['children']) ? record['children'] : []
  return {
    ...record,
    fields: { ...fields, url: path },
    children: children.map((child: unknown) =>
      child && typeof child === 'object' && 'text' in child && child.text === legacyUrl
        ? { ...child, text: new URL(path, siteUrl).toString() }
        : child
    ),
  }
}

export function rewriteLegacyPostLinks<T>(content: T, siteUrl: string): T {
  return rewriteNode(content, siteUrl) as T
}
