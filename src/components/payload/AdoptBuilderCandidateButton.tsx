'use client'

import { useEffect, useRef, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function AdoptBuilderCandidateButton() {
  const { id } = useDocumentInfo()
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const reloadTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (reloadTimer.current !== null) window.clearTimeout(reloadTimer.current)
    },
    []
  )

  if (!id) return null

  async function adoptCandidate() {
    if (!window.confirm('Adopt this analyzed contour and crop as the protected builder mapping?')) {
      return
    }
    setState('saving')
    setMessage('')
    try {
      const response = await fetch(`/api/admin/products/${id}/adopt-builder-candidate`, {
        method: 'POST',
      })
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        className="btn btn--style-primary btn--size-medium"
        disabled={state === 'saving' || state === 'saved'}
        onClick={() => void adoptCandidate()}
      >
        {state === 'saving'
          ? 'Adopting…'
          : state === 'saved'
            ? 'Candidate adopted'
            : 'Adopt builder candidate'}
      </button>
      {message && (
        <span role={state === 'error' ? 'alert' : 'status'} style={{ fontSize: 12, maxWidth: 320 }}>
          {message}
        </span>
      )}
    </div>
  )
}
