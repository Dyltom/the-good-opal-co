import { describe, expect, it } from 'vitest'
import { clientIp } from '../client-ip'

const cloudflareEdge = '172.70.1.2'

describe('clientIp', () => {
  it('uses the visitor address Cloudflare reports when the request came through Cloudflare', () => {
    const headers = new Headers({ 'x-real-ip': cloudflareEdge, 'cf-connecting-ip': '203.0.113.7' })

    expect(clientIp(headers)).toBe('203.0.113.7')
  })

  it('trusts Cloudflare over IPv6 too', () => {
    const headers = new Headers({
      'x-real-ip': '2606:4700:10::ac43:1',
      'cf-connecting-ip': '2001:db8::1',
    })

    expect(clientIp(headers)).toBe('2001:db8::1')
  })

  it('ignores a forged Cloudflare header from a client that hit the server directly', () => {
    const headers = new Headers({ 'x-real-ip': '198.51.100.4', 'cf-connecting-ip': '203.0.113.7' })

    expect(clientIp(headers)).toBe('198.51.100.4')
  })

  it('ignores a forged first X-Forwarded-For entry and keeps the address the proxy saw', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.7, 198.51.100.4' })

    expect(clientIp(headers)).toBe('198.51.100.4')
  })

  it('treats a junk address as unknown', () => {
    expect(clientIp(new Headers({ 'x-real-ip': 'not-an-ip' }))).toBe('unknown')
    expect(clientIp(new Headers())).toBe('unknown')
  })
})
