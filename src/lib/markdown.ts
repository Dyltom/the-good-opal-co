import { wordpressHtmlToLexical, type LexicalDocument } from '@/lib/wordpress/content-import'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(text: string): string {
  return escapeHtml(text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1')).replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2">$1</a>'
  )
}

function markdownToHtml(markdown: string): string {
  const html: string[] = []
  let paragraph: string[] = []
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.join(' '))}</p>`)
    paragraph = []
  }
  const flushList = () => {
    if (list)
      html.push(
        `<${list.tag}>${list.items.map((item) => `<li>${inline(item)}</li>`).join('')}</${list.tag}>`
      )
    list = null
  }
  const addItem = (tag: 'ul' | 'ol', item: string) => {
    flushParagraph()
    if (list?.tag !== tag) {
      flushList()
      list = { tag, items: [] }
    }
    list.items.push(item)
  }

  for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const text = line.trim()
    const heading = text.match(/^(#{1,4})\s+(.+)$/)
    const bullet = text.match(/^[-*•]\s+(.+)$/)
    const numbered = text.match(/^\d+[.)]\s+(.+)$/)
    if (!text) {
      flushParagraph()
      flushList()
    } else if (heading) {
      flushParagraph()
      flushList()
      const level = Math.max(2, heading[1]!.length)
      html.push(`<h${level}>${inline(heading[2]!)}</h${level}>`)
    } else if (bullet) addItem('ul', bullet[1]!)
    else if (numbered) addItem('ol', numbered[1]!)
    else {
      flushList()
      paragraph.push(text)
    }
  }
  flushParagraph()
  flushList()
  return html.join('\n')
}

export function markdownToLexical(markdown: string): LexicalDocument {
  return wordpressHtmlToLexical(markdownToHtml(markdown))
}
