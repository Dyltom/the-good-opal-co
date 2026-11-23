import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionAfterLoginHook,
  CollectionConfig,
  Field,
  PayloadRequest,
} from 'payload'

type Doc = Record<string, unknown>
type AuditAction = 'create' | 'update' | 'trash' | 'restore' | 'delete' | 'login'

export interface FieldChange {
  path: string
  before?: unknown
  after?: unknown
}

const UNAUDITED = new Set([
  'audit-events',
  'insight-events',
  'inventory-reservations',
  'commerce-import-runs',
])
const SYSTEM_AUDITED = new Set(['products', 'orders'])
const IGNORED_PATHS = new Set(['id', 'createdAt', 'updatedAt', 'deletedAt'])
const SECRET_PATH = /password|hash|salt|api_?key|token|reset|secret/i
const VALUE_TYPES = new Set([
  'text',
  'textarea',
  'email',
  'number',
  'checkbox',
  'select',
  'radio',
  'date',
  'relationship',
  'upload',
])
const TITLE_KEYS = ['name', 'title', 'orderNumber', 'quoteNumber', 'email', 'filename']
const MAX_VALUE_LENGTH = 200

interface Leaf {
  path: string
  type: string
}

function leaves(fields: Field[], prefix = ''): Leaf[] {
  return fields.flatMap((field): Leaf[] => {
    const name = 'name' in field && typeof field.name === 'string' ? field.name : undefined
    if (field.type === 'tabs') {
      return field.tabs.flatMap((tab) =>
        leaves(tab.fields, 'name' in tab && tab.name ? `${prefix}${tab.name}.` : prefix)
      )
    }
    if (field.type === 'group' || field.type === 'row' || field.type === 'collapsible') {
      return leaves(field.fields, field.type === 'group' && name ? `${prefix}${name}.` : prefix)
    }
    if (!name || field.type === 'ui') return []
    return [{ path: prefix + name, type: field.type }]
  })
}

function valueAt(doc: Doc | undefined, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (value, key) => (value && typeof value === 'object' ? (value as Doc)[key] : undefined),
      doc
    )
}

function comparable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(comparable)
  if (value && typeof value === 'object' && 'id' in value) return (value as Doc).id
  return value ?? null
}

function isSmall(value: unknown): boolean {
  return (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (typeof value === 'string' && value.length <= MAX_VALUE_LENGTH)
  )
}

export function describeChanges(
  fields: Field[],
  before: Doc | undefined,
  after: Doc | undefined
): FieldChange[] {
  return leaves(fields).flatMap(({ path, type }): FieldChange[] => {
    if (IGNORED_PATHS.has(path)) return []
    const previous = comparable(valueAt(before, path))
    const next = comparable(valueAt(after, path))
    if (JSON.stringify(previous) === JSON.stringify(next)) return []
    if (SECRET_PATH.test(path) || !VALUE_TYPES.has(type) || !isSmall(previous) || !isSmall(next)) {
      return [{ path }]
    }
    return [{ path, before: previous, after: next }]
  })
}

function titleOf(doc: Doc): string {
  for (const key of TITLE_KEYS) {
    const value = doc[key]
    if (typeof value === 'string' && value.trim() !== '') return value.slice(0, MAX_VALUE_LENGTH)
  }
  return String(doc.id ?? '')
}

interface AuditEntry {
  action: AuditAction
  collectionSlug: string
  doc: Doc
  changes?: FieldChange[]
  user?: Doc
}

async function record(
  req: PayloadRequest,
  { action, collectionSlug, doc, changes, user }: AuditEntry
) {
  try {
    const actor = user ?? (req.user as Doc | null | undefined)
    await req.payload.create({
      collection: 'audit-events',
      data: {
        occurredAt: new Date().toISOString(),
        user: actor && typeof actor.id === 'number' ? actor.id : null,
        userEmail: actor && typeof actor.email === 'string' ? actor.email : null,
        how: !actor ? 'system' : actor._strategy === 'api-key' ? 'api-key' : 'admin',
        action,
        collectionSlug,
        documentId: doc.id === undefined ? null : String(doc.id),
        title: titleOf(doc),
        changes: changes && changes.length > 0 ? changes : null,
      },
      req,
      overrideAccess: true,
    })
  } catch (error) {
    console.error(`Audit log could not record ${action} on ${collectionSlug}`, error)
  }
}

function shouldRecord(req: PayloadRequest, collectionSlug: string): boolean {
  return Boolean(req.user) || SYSTEM_AUDITED.has(collectionSlug)
}

export const recordChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (!shouldRecord(req, collection.slug)) return doc
  try {
    const wasTrashed = Boolean(previousDoc?.deletedAt)
    const isTrashed = Boolean(doc.deletedAt)
    const action: AuditAction =
      operation === 'create'
        ? 'create'
        : !wasTrashed && isTrashed
          ? 'trash'
          : wasTrashed && !isTrashed
            ? 'restore'
            : 'update'
    const changes = action === 'update' ? describeChanges(collection.fields, previousDoc, doc) : []
    if (action === 'update' && changes.length === 0) return doc
    await record(req, { action, collectionSlug: collection.slug, doc, changes })
  } catch (error) {
    console.error(`Audit log could not record a change on ${collection.slug}`, error)
  }
  return doc
}

export const recordDelete: CollectionAfterDeleteHook = async ({ collection, doc, req }) => {
  if (!shouldRecord(req, collection.slug)) return doc
  await record(req, { action: 'delete', collectionSlug: collection.slug, doc })
  return doc
}

export const recordLogin: CollectionAfterLoginHook = async ({ collection, req, user }) => {
  await record(req, { action: 'login', collectionSlug: collection.slug, doc: user, user })
}

export function audited(collection: CollectionConfig): CollectionConfig {
  if (UNAUDITED.has(collection.slug)) return collection
  const hooks = collection.hooks ?? {}
  return {
    ...collection,
    hooks: {
      ...hooks,
      afterChange: [...(hooks.afterChange ?? []), recordChange],
      afterDelete: [...(hooks.afterDelete ?? []), recordDelete],
      ...(collection.auth ? { afterLogin: [...(hooks.afterLogin ?? []), recordLogin] } : {}),
    },
  }
}
