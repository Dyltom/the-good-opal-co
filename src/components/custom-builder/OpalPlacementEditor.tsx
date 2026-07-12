'use client'

import type { PointerEvent as ReactPointerEvent } from 'react'
import { useRef } from 'react'
import { Move, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BuilderOpal, OpalPlacement } from './config'
import { defaultOpalPlacement } from './config'
import { OpalFaceImage } from './OpalFaceImage'

interface OpalPlacementEditorProps {
  onChange: (placement: OpalPlacement) => void
  opal: BuilderOpal
  placement: OpalPlacement
}

interface DragState extends OpalPlacement {
  height: number
  pointerId: number
  width: number
  x: number
  y: number
}

const limits = {
  position: 0.45,
  rotation: 180,
  scaleMax: 2.25,
  scaleMin: 0.75,
} as const

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function silhouetteClass(shape: BuilderOpal['visual']['silhouette']): string {
  if (shape === 'round') return 'rounded-full'
  if (shape === 'cushion') return 'rounded-[22%]'
  return shape === 'pear' ? '[clip-path:polygon(50%_0%,76%_15%,92%_45%,86%_70%,50%_100%,14%_70%,8%_45%,24%_15%)]' : 'rounded-[50%]'
}

function RangeControl({
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
}) {
  return (
    <label className="grid gap-2 text-xs font-medium text-charcoal">
      <span className="flex items-center justify-between gap-3">
        {label}
        <output className="font-normal tabular-nums text-charcoal-light">
          {label === 'Rotation' ? `${Math.round(value)}°` : value.toFixed(2)}
        </output>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full cursor-pointer accent-charcoal"
      />
    </label>
  )
}

export function OpalPlacementEditor({
  onChange,
  opal,
  placement,
}: OpalPlacementEditorProps) {
  const drag = useRef<DragState | null>(null)

  function update<K extends keyof OpalPlacement>(key: K, value: OpalPlacement[K]) {
    onChange({ ...placement, [key]: value })
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = {
      ...placement,
      height: bounds.height,
      pointerId: event.pointerId,
      width: bounds.width,
      x: event.clientX,
      y: event.clientY,
    }
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const start = drag.current
    if (!start || start.pointerId !== event.pointerId) return

    onChange({
      ...placement,
      opalPositionX: clamp(
        start.opalPositionX - ((event.clientX - start.x) / start.width) * 0.7,
        -limits.position,
        limits.position
      ),
      opalPositionY: clamp(
        start.opalPositionY - ((event.clientY - start.y) / start.height) * 0.7,
        -limits.position,
        limits.position
      ),
    })
  }

  function stopDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null
  }

  return (
    <fieldset>
      <legend className="font-serif text-xl font-medium">4. Position colour and cut</legend>
      <p className="mt-2 text-sm leading-6 text-charcoal-light">
        Drag the photographed opal beneath the setting outline. This records approximate colour,
        orientation, and cut placement for your maker to review against the physical stone.
      </p>

      <div className="mt-4 grid gap-6 rounded-xl border border-warm-grey/80 bg-white p-4 sm:grid-cols-[minmax(10rem,0.72fr)_minmax(13rem,1fr)] sm:items-center sm:p-5">
        <div className="mx-auto w-full max-w-[15rem]">
          <div
            role="img"
            aria-label={`Adjust approximate cut placement for ${opal.name}. Drag the image or use the controls.`}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            className="relative touch-none select-none rounded-2xl bg-[#171714] p-5 shadow-inner"
          >
            <div
              className={cn(
                'relative mx-auto w-[82%] overflow-hidden border-[5px] border-[#d8d8d4] bg-charcoal shadow-[0_10px_26px_rgb(0_0_0/0.35)]',
                silhouetteClass(opal.visual.silhouette)
              )}
              style={{ aspectRatio: 1 / opal.visual.aspectRatio }}
            >
              <OpalFaceImage
                opal={opal}
                placement={placement}
                alt=""
                sizes="240px"
                className="h-full w-full"
              />
            </div>
            <span className="pointer-events-none absolute bottom-2.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black-rich/80 px-3 py-1.5 text-[0.65rem] text-cream/85">
              <Move aria-hidden="true" className="h-3.5 w-3.5" /> Drag to position
            </span>
          </div>
          <p className="mt-2 text-center text-[0.68rem] leading-4 text-charcoal-light">
            Visual guide only. Final cut depends on colour bar, inclusions, stability, and yield.
          </p>
        </div>

        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
          <RangeControl
            label="Horizontal"
            min={-limits.position}
            max={limits.position}
            step={0.01}
            value={placement.opalPositionX}
            onChange={(value) => update('opalPositionX', value)}
          />
          <RangeControl
            label="Vertical"
            min={-limits.position}
            max={limits.position}
            step={0.01}
            value={placement.opalPositionY}
            onChange={(value) => update('opalPositionY', value)}
          />
          <RangeControl
            label="Zoom"
            min={limits.scaleMin}
            max={limits.scaleMax}
            step={0.05}
            value={placement.opalScale}
            onChange={(value) => update('opalScale', value)}
          />
          <RangeControl
            label="Rotation"
            min={-limits.rotation}
            max={limits.rotation}
            step={5}
            value={placement.opalRotation}
            onChange={(value) => update('opalRotation', value)}
          />
          <button
            type="button"
            onClick={() => onChange(defaultOpalPlacement)}
            className="mt-1 inline-flex min-h-11 items-center gap-2 justify-self-start text-sm text-charcoal-light underline decoration-warm-grey underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" /> Recommended placement
          </button>
        </div>
      </div>
    </fieldset>
  )
}
