import type { CollectionAfterChangeHook, CollectionConfig, Field, PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'
import { Products } from '../collections/Products'
import { recordChange } from '../audit-log'

type HookArgs = Parameters<CollectionAfterChangeHook>[0]

const richText = (text: string) => ({
  root: { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', text }] }] },
})

function requestFor(user: Record<string, unknown> | null, create = vi.fn().mockResolvedValue({})) {
  return { req: { user, payload: { create } } as unknown as PayloadRequest, create }
}

async function update(
  collection: Pick<CollectionConfig, 'slug' | 'fields'>,
  previousDoc: object,
  doc: object,
  req: PayloadRequest
) {
  return recordChange({
    collection,
    doc,
    previousDoc,
    operation: 'update',
    req,
    context: {},
    data: doc,
  } as unknown as HookArgs)
}

describe('audit log', () => {
  it('records who changed a product, how, and the before and after of small fields', async () => {
    const { req, create } = requestFor({
      id: 3,
      email: 'steph@example.com',
      collection: 'users',
      _strategy: 'api-key',
    })

    await update(
      Products,
      { id: 41, name: 'Boulder opal', price: 100, status: 'draft', stock: 1 },
      { id: 41, name: 'Boulder opal', price: 150, status: 'published', stock: 1 },
      req
    )

    expect(create).toHaveBeenCalledOnce()
    const { data, overrideAccess } = create.mock.calls[0][0]
    expect(overrideAccess).toBe(true)
    expect(data).toMatchObject({
      user: 3,
      userEmail: 'steph@example.com',
      how: 'api-key',
      action: 'update',
      collectionSlug: 'products',
      documentId: '41',
      title: 'Boulder opal',
      changes: [
        { path: 'price', before: 100, after: 150 },
        { path: 'status', before: 'draft', after: 'published' },
      ],
    })
  })

  it('credits changes made through the Claude sign-in to the Claude connector', async () => {
    const { req, create } = requestFor({
      id: 3,
      email: 'steph@example.com',
      collection: 'users',
      _strategy: 'claude-oauth',
    })

    await update(
      Products,
      { id: 41, name: 'Boulder opal', price: 100, status: 'draft', stock: 1 },
      { id: 41, name: 'Boulder opal', price: 150, status: 'draft', stock: 1 },
      req
    )

    expect(create.mock.calls[0][0].data.how).toBe('api-key')
  })

  it('never stores secret values or rich text bodies, only that they changed', async () => {
    const fields: Field[] = [
      { name: 'name', type: 'text' },
      { name: 'apiKey', type: 'text' },
      { name: 'resetPasswordToken', type: 'text' },
      { name: 'notes', type: 'richText' },
    ]
    const { req, create } = requestFor({ id: 1, email: 'dylan@example.com', collection: 'users' })

    await update(
      { slug: 'users', fields },
      {
        id: 1,
        name: 'Dylan',
        apiKey: 'old-secret-key',
        resetPasswordToken: null,
        notes: richText('old private note'),
      },
      {
        id: 1,
        name: 'Dylan',
        apiKey: 'new-secret-key',
        resetPasswordToken: 'reset-123',
        notes: richText('new private note'),
      },
      req
    )

    const { data } = create.mock.calls[0][0]
    expect(data.changes).toEqual([
      { path: 'apiKey' },
      { path: 'resetPasswordToken' },
      { path: 'notes' },
    ])
    expect(JSON.stringify(data)).not.toMatch(/secret-key|reset-123|private note/)
  })

  it('lets the save go through when the audit entry cannot be written', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('database unavailable'))
    const { req } = requestFor({ id: 3, email: 'steph@example.com', collection: 'users' }, failing)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const doc = { id: 41, name: 'Boulder opal', price: 150 }

    await expect(
      update(Products, { id: 41, name: 'Boulder opal', price: 100 }, doc, req)
    ).resolves.toBe(doc)
    expect(failing).toHaveBeenCalledOnce()
    consoleError.mockRestore()
  })

  it('skips system writes to collections other than products and orders', async () => {
    const { req, create } = requestFor(null)

    await update(
      { slug: 'customers', fields: [{ name: 'email', type: 'email' }] },
      { id: 1, email: 'a@x.com' },
      { id: 1, email: 'b@x.com' },
      req
    )

    expect(create).not.toHaveBeenCalled()
  })
})
