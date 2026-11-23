import type { CollectionConfig, Field, FieldHook } from 'payload'

const copySlug: FieldHook = ({ value }) =>
  typeof value === 'string' && value.trim() !== ''
    ? `${value}-copy-${Math.random().toString(36).slice(2, 6)}`
    : value

const clearValue: FieldHook = () => null

function withDuplicateHook(field: Field): Field {
  if (field.type === 'tabs') {
    return { ...field, tabs: field.tabs.map((tab) => ({ ...tab, fields: tab.fields.map(withDuplicateHook) })) }
  }
  if ('fields' in field) return { ...field, fields: field.fields.map(withDuplicateHook) } as Field
  if (!('unique' in field) || !field.unique || field.hooks?.beforeDuplicate?.length) return field
  return {
    ...field,
    hooks: { ...field.hooks, beforeDuplicate: [field.name === 'slug' ? copySlug : clearValue] },
  }
}

export function duplicateSafe(collection: CollectionConfig): CollectionConfig {
  return { ...collection, fields: collection.fields.map(withDuplicateHook) }
}
