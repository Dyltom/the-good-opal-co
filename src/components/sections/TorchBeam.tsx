'use client'

import type { PointerEvent, ReactNode } from 'react'

function aim(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType === 'touch') return
  const box = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--beam-x', `${event.clientX - box.left}px`)
  event.currentTarget.style.setProperty('--beam-y', `${event.clientY - box.top}px`)
}

function rest(event: PointerEvent<HTMLDivElement>) {
  event.currentTarget.style.removeProperty('--beam-x')
  event.currentTarget.style.removeProperty('--beam-y')
}

export function TorchBeam({ className, children }: { className: string; children: ReactNode }) {
  return (
    <div onPointerMove={aim} onPointerLeave={rest} className={`torch-beam ${className}`}>
      {children}
    </div>
  )
}
