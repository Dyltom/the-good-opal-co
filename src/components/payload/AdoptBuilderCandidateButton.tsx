'use client'

import { useEffect, useRef, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function AdoptBuilderCandidateButton() {
  const { id } = useDocumentInfo()
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [action, setAction] = useState<'full' | 'placement' | null>(null)
  const [message, setMessage] = useState('')
  const reloadTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (reloadTimer.current !== null) window.clearTimeout(reloadTimer.current)
    },
    []
  )

  if (!id) return null

  async function adoptCandidate(mode: 'full' | 'placement') {
    const confirmation =
      mode === 'placement'
        ? 'Apply the analyzed image placement without changing the approved contour or review status?'
        : 'Adopt this analyzed contour and image placement as the protected builder mapping?'
    if (!window.confirm(confirmation)) {
      return
    }
    setState('saving')
    setAction(mode)
    setMessage('')
    try {
      const query = mode === 'placement' ? '?mode=placement' : ''
      const response = await fetch(
        `/api/admin/products/${id}/adopt-builder-candidate${query}`,
        { method: 'POST' }
      )
      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) throw new Error(result.error ?? 'Candidate adoption failed.')
      setState('saved')
      setMessage(result.message ?? 'Candidate adopted.')
      reloadTimer.current = window.setTimeout(() => window.location.reload(), 900)
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Candidate adoption failed.')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <button
        type="button"
        className="btn btn--style-primary btn--size-medium"
        disabled={state === 'saving' || state === 'saved'}
        onClick={() => void adoptCandidate('placement')}
      >
        {state === 'saving' && action === 'placement'
          ? 'Applying placement…'
          : state === 'saved' && action === 'placement'
            ? 'Placement applied'
            : 'Apply candidate placement'}
      </button>
      <button
        type="button"
        className="btn btn--style-secondary btn--size-medium"
        disabled={state === 'saving' || state === 'saved'}
        onClick={() => void adoptCandidate('full')}
      >
        {state === 'saving' && action === 'full'
          ? 'Adopting mapping…'
          : state === 'saved' && action === 'full'
            ? 'Mapping adopted'
            : 'Adopt contour + placement'}
      </button>
      {message && (
        <span role={state === 'error' ? 'alert' : 'status'} style={{ fontSize: 12, maxWidth: 320 }}>
          {message}
        </span>
      )}
    </div>
  )
}
