import { describe, expect, test } from 'vitest'
import { HELP_LINKS } from '@/components/payload/help/help-links'
import { renderOwnerGuide } from '../owner-guide'

describe('owner guide in the admin', () => {
  test('every "How to" link in the admin lists points at a section of the guide', async () => {
    const { html } = await renderOwnerGuide()
    const ids = new Set([...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]))
    const anchors = Object.values(HELP_LINKS).flatMap((links) => links.map((link) => link.anchor))

    expect(anchors.filter((anchor) => !ids.has(anchor))).toEqual([])
  })

  test('guide screenshots are embedded so they load behind the admin login', async () => {
    const { html } = await renderOwnerGuide()

    expect(html).toContain('src="data:image/png;base64,')
    expect(html).not.toMatch(/src="(?!data:)/)
  })
})
