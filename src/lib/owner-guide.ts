import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { Marked } from 'marked'

const DOCS_DIR = path.join(process.cwd(), 'docs')
const GUIDE_FILE = path.join(DOCS_DIR, 'OWNER-GUIDE.md')
const IMAGE_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

export interface OwnerGuideSection {
  id: string
  title: string
}

export interface OwnerGuide {
  html: string
  sections: OwnerGuideSection[]
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/^\d+\.\s+/, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function imageDataUris(markdown: string): Promise<Map<string, string>> {
  const hrefs = new Set([...markdown.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((match) => match[1]!))
  const entries = await Promise.all(
    [...hrefs].map(async (href) => {
      const file = path.resolve(DOCS_DIR, href)
      const type = IMAGE_TYPES[path.extname(file).toLowerCase()]
      if (!type || !file.startsWith(DOCS_DIR + path.sep)) return null
      const data = await readFile(file).catch(() => null)
      return data ? ([href, `data:${type};base64,${data.toString('base64')}`] as const) : null
    })
  )
  return new Map(entries.filter((entry) => entry !== null))
}

export async function renderOwnerGuide(): Promise<OwnerGuide> {
  const markdown = await readFile(GUIDE_FILE, 'utf8')
  const images = await imageDataUris(markdown)
  const sections: OwnerGuideSection[] = []
  const used = new Map<string, number>()

  const marked = new Marked({
    renderer: {
      heading({ tokens, depth, text }) {
        const base = slug(text) || 'section'
        const count = used.get(base) ?? 0
        used.set(base, count + 1)
        const id = count ? `${base}-${count + 1}` : base
        const inner = this.parser.parseInline(tokens)
        if (depth === 2) sections.push({ id, title: text })
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`
      },
      image({ href, text }) {
        const src = images.get(href)
        return src ? `<img src="${src}" alt="${escapeHtml(text)}" loading="lazy">` : escapeHtml(text)
      },
      html({ text }) {
        return escapeHtml(text)
      },
    },
  })

  const html = await marked.parse(markdown)
  return { html, sections }
}
