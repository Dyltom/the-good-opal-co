import { NextRequest } from 'next/server'
import { describe, expect, test } from 'vitest'
import { isSameOriginRequest } from '../same-origin'

function post(headers: Record<string, string>) {
  return new NextRequest('http://0.0.0.0:3000/api/admin/products/42/adopt-builder-candidate', {
    method: 'POST',
    headers,
  })
}

describe('isSameOriginRequest', () => {
  test('accepts the admin UI behind a proxy that rewrites the internal URL', () => {
    expect(
      isSameOriginRequest(
        post({
          origin: 'https://shop.example',
          'x-forwarded-host': 'shop.example',
          host: '0.0.0.0:3000',
        })
      )
    ).toBe(true)
    expect(
      isSameOriginRequest(post({ origin: 'https://shop.example', host: 'shop.example' }))
    ).toBe(true)
  })

  test('rejects a request sent from another site', () => {
    expect(
      isSameOriginRequest(
        post({ origin: 'https://evil.example', 'x-forwarded-host': 'shop.example' })
      )
    ).toBe(false)
  })

  test('rejects a malformed origin', () => {
    expect(isSameOriginRequest(post({ origin: 'not a url', host: 'shop.example' }))).toBe(false)
  })

  test('allows server-to-server calls that send no origin', () => {
    expect(isSameOriginRequest(post({}))).toBe(true)
  })
})
