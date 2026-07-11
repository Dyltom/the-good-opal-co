'use client'

import { useEffect, useRef, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export function SendCustomQuoteButton() {
  const { id } = useDocumentInfo()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const reloadTimer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (reloadTimer.current !== null) window.clearTimeout(reloadTimer.current)
    },
    []
  )

  if (!id) return null

  async function sendQuote() {
    setState('sending')
    setMessage('')
    try {
      const response = await fetch(`/api/admin/custom-quotes/${id}/send`, { method: 'POST' })
      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) throw new Error(result.error ?? 'Quote delivery failed.')
      setState('sent')
      setMessage(result.message ?? 'Quote delivered securely.')
      reloadTimer.current = window.setTimeout(() => window.location.reload(), 700)
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Quote delivery failed.')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        className="btn btn--style-primary btn--size-medium"
        disabled={state === 'sending' || state === 'sent'}
        onClick={() => void sendQuote()}
      >
        {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent' : 'Send / retry quote'}
      </button>
      {message && (
        <span role={state === 'error' ? 'alert' : 'status'} style={{ fontSize: 12, maxWidth: 240 }}>
          {message}
        </span>
      )}
    </div>
  )
}
