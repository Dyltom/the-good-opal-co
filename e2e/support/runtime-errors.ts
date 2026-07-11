import { expect, type Page } from '@playwright/test'

export function failOnRuntimeErrors(page: Page) {
  const errors: string[] = []

  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('response', (response) => {
    const requestUrl = new URL(response.url())
    const pageUrl = page.url()
    if (!pageUrl.startsWith('http')) return

    const currentOrigin = new URL(pageUrl).origin
    if (requestUrl.origin === currentOrigin && response.status() >= 400) {
      errors.push(`${response.status()} ${requestUrl.pathname}`)
    }
  })

  return () => expect(errors, 'unexpected browser or same-origin HTTP errors').toEqual([])
}
