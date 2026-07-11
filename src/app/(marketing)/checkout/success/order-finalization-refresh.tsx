'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const REFRESH_INTERVAL_MS = 2500
const MAX_REFRESH_ATTEMPTS = 8

export function OrderFinalizationRefresh({ pending }: { pending: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!pending) return

    let attempts = 0
    const interval = window.setInterval(() => {
      attempts += 1
      router.refresh()
      if (attempts >= MAX_REFRESH_ATTEMPTS) window.clearInterval(interval)
    }, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [pending, router])

  return null
}
