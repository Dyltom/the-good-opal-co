const LISTING_FOOTER =
  /^(please note:?|priced in aud\.?|all images and videos are taken|if you have any queries|message sent)/i
const INCLUSIONS = /\s*Inclusions(?: are)?:\s*([^\n]+?)\.?\s*$/i
const WHITE_LIGHT = /taken under white light[^.]*not edited/i

export interface ProductDescription {
  paragraphs: string[]
  inclusions?: string
  photographedUnderWhiteLight: boolean
}

function collectBlocks(node: unknown, blocks: string[]): void {
  if (!node || typeof node !== 'object') return
  const record = node as Record<string, unknown>
  if (record['root']) collectBlocks(record['root'], blocks)
  const children = record['children']
  if (!Array.isArray(children)) return

  const isBlock = record['type'] === 'paragraph' || record['type'] === 'heading'
  if (isBlock) {
    blocks.push(
      children
        .map((child) =>
          child && typeof child === 'object' && typeof (child as Record<string, unknown>)['text'] === 'string'
            ? ((child as Record<string, unknown>)['text'] as string)
            : (child as Record<string, unknown>)?.['type'] === 'linebreak'
              ? '\n'
              : ''
        )
        .join('')
    )
    return
  }
  for (const child of children) collectBlocks(child, blocks)
}

export function parseProductDescription(value: unknown): ProductDescription {
  const blocks: string[] = []
  if (typeof value === 'string') blocks.push(value)
  else collectBlocks(value, blocks)

  const raw = blocks.join('\n\n')
  const paragraphs: string[] = []
  let inclusions: string | undefined

  for (const block of raw.split(/\n\s*\n/)) {
    let text = block.replace(/\s+/g, ' ').trim()
    if (!text) continue
    if (LISTING_FOOTER.test(text)) break

    const match = text.match(INCLUSIONS)
    if (match?.[1]) {
      inclusions = match[1].trim()
      text = text.slice(0, match.index).trim()
    }
    if (text) paragraphs.push(text)
  }

  return { paragraphs, inclusions, photographedUnderWhiteLight: WHITE_LIGHT.test(raw) }
}

function numberSet(text: string): string {
  return [...new Set(text.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? [])].sort((a, b) => a - b).join(',')
}

export function hasSameNumbers(a: string, b: string): boolean {
  const numbers = numberSet(a)
  return numbers !== '' && numbers === numberSet(b)
}
