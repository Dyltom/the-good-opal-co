import { describe, expect, it } from 'vitest'
import {
  createCampaignUnsubscribeToken,
  readCampaignUnsubscribeToken,
} from '../campaign-unsubscribe-token'

describe('campaign unsubscribe tokens', () => {
  it('round-trips an opaque, signed customer identifier', () => {
    const token = createCampaignUnsubscribeToken(42, 'test-secret')

    expect(token).not.toContain('42')
    expect(readCampaignUnsubscribeToken(token, 'test-secret')).toBe('42')
  })

  it('rejects tampered tokens and tokens signed with another secret', () => {
    const token = createCampaignUnsubscribeToken('customer-1', 'test-secret')
    const tampered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`

    expect(readCampaignUnsubscribeToken(tampered, 'test-secret')).toBeNull()
    expect(readCampaignUnsubscribeToken(token, 'other-secret')).toBeNull()
    expect(readCampaignUnsubscribeToken('malformed', 'test-secret')).toBeNull()
  })
})
