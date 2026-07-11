import { describe, expect, test } from 'vitest'
import { serializeJsonLd } from '../json-ld'

describe('JSON-LD serialization', () => {
  test('escapes script-breaking CMS content while preserving parsed data', () => {
    const malicious = '</script><script>alert("opal")</script> & \u2028'
    const serialized = serializeJsonLd({ name: malicious })

    expect(serialized).not.toContain('<')
    expect(serialized).not.toContain('>')
    expect(serialized).not.toContain('&')
    expect(serialized).not.toContain('\u2028')
    expect(JSON.parse(serialized)).toEqual({ name: malicious })
  })
})
