import { describe, expect, test } from 'vitest'
import {
  isRetriedSerializationFailure,
  retryOnSerializationFailure,
} from '@/payload/retry-serialization'

const serializationFailure = Object.assign(new Error('could not serialize access'), {
  code: '40001',
})
const noWait = async () => {}

function uploadRequest() {
  return new Request('https://example.test/api/media', { method: 'POST', body: 'photo-bytes' })
}

describe('REST retry on Postgres serialization failures', () => {
  test('replays the full upload body until the insert commits', async () => {
    const bodies: string[] = []
    const handler = retryOnSerializationFailure(
      async (request: Request) => {
        bodies.push(await request.text())
        if (bodies.length < 3) {
          isRetriedSerializationFailure(serializationFailure)
          return new Response('conflict', { status: 500 })
        }
        return new Response('created', { status: 201 })
      },
      { sleep: noWait }
    )

    const response = await handler(uploadRequest(), {})

    expect(response.status).toBe(201)
    expect(bodies).toEqual(['photo-bytes', 'photo-bytes', 'photo-bytes'])
  })

  test('does not retry other failures', async () => {
    let calls = 0
    const handler = retryOnSerializationFailure(
      async () => {
        calls += 1
        isRetriedSerializationFailure(new Error('disk full'))
        return new Response('error', { status: 500 })
      },
      { sleep: noWait }
    )

    expect((await handler(uploadRequest(), {})).status).toBe(500)
    expect(calls).toBe(1)
  })

  test('reports the failure on the last attempt so it is still logged', async () => {
    const retried: boolean[] = []
    const handler = retryOnSerializationFailure(
      async () => {
        retried.push(isRetriedSerializationFailure(serializationFailure))
        return new Response('conflict', { status: 500 })
      },
      { attempts: 3, sleep: noWait }
    )

    expect((await handler(uploadRequest(), {})).status).toBe(500)
    expect(retried).toEqual([true, true, false])
  })
})
