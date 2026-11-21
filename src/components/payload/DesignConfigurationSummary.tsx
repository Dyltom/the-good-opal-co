'use client'

import { useEffect, useState } from 'react'
import { useFormFields } from '@payloadcms/ui'
import {
  describeRingConfig,
  ringConfigSchema,
  ringConfigToSearchParams,
  settings,
} from '@/components/custom-builder/config'

export function DesignConfigurationSummary() {
  const raw = useFormFields(([fields]) => fields.designConfiguration?.value)
  const parsed = ringConfigSchema.safeParse(raw)
  const config = parsed.success ? parsed.data : null
  const opalId = config?.opalId && /^\d+$/.test(config.opalId) ? config.opalId : undefined
  const [opalName, setOpalName] = useState<string>()

  useEffect(() => {
    setOpalName(undefined)
    if (!opalId) return
    const controller = new AbortController()
    fetch(`/api/products/${encodeURIComponent(opalId)}?depth=0`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((product: { name?: string } | null) => setOpalName(product?.name))
      .catch(() => undefined)
    return () => controller.abort()
  }, [opalId])

  if (!config) return null

  const setting = settings.find((option) => option.id === config.setting)?.label ?? config.setting

  return (
    <div className="field-type" style={{ marginBottom: 'var(--spacing-field)' }}>
      <span className="field-label">Ring design</span>
      <p style={{ margin: '4px 0', fontSize: 16 }}>{describeRingConfig(config, opalName)}</p>
      <p style={{ margin: '0 0 8px', color: 'var(--theme-elevation-650)' }}>
        {setting}
        {opalId && (
          <>
            {' · '}
            <a href={`/admin/collections/products/${encodeURIComponent(opalId)}`}>
              {opalName ? `View ${opalName}` : 'View chosen opal'}
            </a>
          </>
        )}
      </p>
      <a
        href={`/services/design?${ringConfigToSearchParams(config).toString()}`}
        target="_blank"
        rel="noreferrer"
      >
        Open this design in the ring designer
      </a>
    </div>
  )
}
