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
