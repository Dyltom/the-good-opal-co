'use client'

import { useEffect } from 'react'

export function OpalLight() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const root = document.documentElement
    let frame = 0
    let angle = 210

    const apply = () => {
      frame = 0
      root.style.setProperty('--opal-angle', `${angle.toFixed(1)}deg`)
    }
    const schedule = (next: number) => {
      angle = next
      if (!frame) frame = window.requestAnimationFrame(apply)
    }
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const x = event.clientX / window.innerWidth
      const y = event.clientY / window.innerHeight
      schedule(150 + x * 140 + y * 60)
    }
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return
      schedule(210 + event.gamma * 2 + (event.beta - 45))
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
