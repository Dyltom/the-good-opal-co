'use client'

import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'torch'

function readSavedPosition(): [number, number] | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')
    if (Array.isArray(value) && typeof value[0] === 'number' && typeof value[1] === 'number') {
      return [value[0], value[1]]
    }
  } catch {
    return null
  }
  return null
}

function savePosition(x: number, y: number) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([x / innerWidth, y / innerHeight]))
  } catch {
    return
  }
}

export function Torch() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const torch = ref.current
    if (!torch) return

    const saved = readSavedPosition()
    let x = saved ? saved[0] * innerWidth : innerWidth * 0.7
    let y = saved ? saved[1] * innerHeight : innerHeight * 0.32
    let targetX = x
    let targetY = y
    let frame = 0

    const place = () => {
      torch.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`
    }
    place()

    const tracks =
      matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!tracks) return

    const step = () => {
      x += (targetX - x) * 0.12
      y += (targetY - y) * 0.12
      if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.6) {
        place()
        frame = requestAnimationFrame(step)
      } else {
        x = targetX
        y = targetY
        place()
        frame = 0
      }
    }
    const aim = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!frame) frame = requestAnimationFrame(step)
    }
    const dim = () => torch.style.setProperty('--to', '0.45')
    const lift = () => torch.style.setProperty('--to', '1')
    const save = () => savePosition(targetX, targetY)
    const root = document.documentElement

    addEventListener('pointermove', aim, { passive: true })
    addEventListener('pagehide', save)
    root.addEventListener('pointerleave', dim)
    root.addEventListener('pointerenter', lift)

    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('pointermove', aim)
      removeEventListener('pagehide', save)
      root.removeEventListener('pointerleave', dim)
      root.removeEventListener('pointerenter', lift)
    }
  }, [])

  return <div ref={ref} className="torch" aria-hidden="true" />
}
