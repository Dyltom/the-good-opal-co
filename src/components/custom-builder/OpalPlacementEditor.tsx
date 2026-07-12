'use client'

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'
import { Move, RotateCcw, RotateCw, SlidersHorizontal, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BuilderOpal, OpalPlacement, RingConfig } from './config'
import { defaultOpalPlacement } from './config'
import { OpalFaceImage } from './OpalFaceImage'
import { cssSilhouetteClipPath } from './geometry'

interface OpalPlacementEditorProps {
  onChange: (placement: OpalPlacement) => void
  opal: BuilderOpal
  placement: OpalPlacement
  metal: RingConfig['metal']
  style: RingConfig['style']
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

function roundPlacement(value: number): number {
  return Math.round(value * 1000) / 1000
}

function silhouetteClass(shape: BuilderOpal['visual']['silhouette']): string {
  if (shape === 'round') return 'rounded-full'
  if (shape === 'cushion') return 'rounded-[22%]'
  return shape === 'pear' || shape === 'heart' ? '' : 'rounded-[50%]'
}

const metalColours: Record<RingConfig['metal'], string> = {
  'sterling-silver': '#d2d3cf',
  '14k-gold': '#cda84d',
  '18k-gold': '#d9ad42',
  'white-gold': '#dfddd5',
  'rose-gold': '#bd806e',
  platinum: '#e4e3df',
}

const styleLabels: Record<RingConfig['style'], string> = {
  aurora: 'Aurora halo',
  coral: 'Coral clean bezel',
  gemini: 'Gemini clean bezel',
  'sun-moon': 'Sun & Moon beaded trim',
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
  metal,
  onChange,
  opal,
  placement,
  style,
}: OpalPlacementEditorProps) {
  const drag = useRef<DragState | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const clipPath = cssSilhouetteClipPath(opal.visual.silhouette)

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
    setIsDragging(true)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const start = drag.current
    if (!start || start.pointerId !== event.pointerId) return

    onChange({
      ...placement,
      opalPositionX: roundPlacement(
        clamp(
          start.opalPositionX + ((event.clientX - start.x) / start.width) * 0.7,
          -limits.position,
          limits.position
        )
      ),
      opalPositionY: roundPlacement(
        clamp(
          start.opalPositionY + ((event.clientY - start.y) / start.height) * 0.7,
          -limits.position,
          limits.position
        )
      ),
    })
  }

  function stopDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) {
      drag.current = null
      setIsDragging(false)
    }
  }

  function nudge(event: KeyboardEvent<HTMLDivElement>) {
    const delta = event.shiftKey ? 0.05 : 0.01
    const next = { ...placement }

    if (event.key === 'ArrowLeft') next.opalPositionX -= delta
    else if (event.key === 'ArrowRight') next.opalPositionX += delta
    else if (event.key === 'ArrowUp') next.opalPositionY -= delta
    else if (event.key === 'ArrowDown') next.opalPositionY += delta
    else return

    event.preventDefault()
    next.opalPositionX = clamp(next.opalPositionX, -limits.position, limits.position)
    next.opalPositionY = clamp(next.opalPositionY, -limits.position, limits.position)
    onChange(next)
  }

  return (
    <fieldset>
      <legend className="font-serif text-xl font-medium">4. Position colour and cut</legend>
      <p className="mt-2 max-w-[62ch] text-sm leading-6 text-charcoal-light">
        Move the real listing photo beneath your chosen setting. Place the strongest colour where
        you want it to appear, then fine-tune only if needed.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-warm-grey/80 bg-white shadow-[0_10px_30px_rgb(31_30_25/0.06)]">
        <div className="grid gap-5 bg-[#171714] p-4 text-cream sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-opal-light">
                Stone workbench
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-cream/75">{opal.name}</p>
            </div>
            <span className="rounded-full border border-cream/20 px-3 py-1 text-[0.68rem] text-cream/75">
              {styleLabels[style]}
            </span>
          </div>

          <div
            role="group"
            tabIndex={0}
            aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
            aria-roledescription="opal photo placement"
            aria-label={`Adjust approximate cut placement for ${opal.name}. Drag the image or use the controls.`}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={stopDrag}
            onPointerCancel={stopDrag}
            onKeyDown={nudge}
            className={cn(
              'relative grid min-h-[20rem] touch-none select-none place-items-center overflow-hidden rounded-lg border border-cream/10 bg-[radial-gradient(circle_at_center,rgb(255_255_255/0.075),transparent_58%)] p-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-light sm:min-h-[24rem]',
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            )}
          >
            <div
              className={cn(
                'relative mx-auto w-[58%] p-[5px] shadow-[0_18px_36px_rgb(0_0_0/0.48)] sm:w-[52%]',
                style === 'sun-moon' && 'outline outline-dotted outline-[5px] outline-offset-[5px]',
                style === 'aurora' && 'outline outline-dotted outline-[8px] outline-offset-[6px]',
                silhouetteClass(opal.visual.silhouette)
              )}
              style={{
                aspectRatio: 1 / opal.visual.aspectRatio,
                backgroundColor: metalColours[metal],
                clipPath,
                outlineColor:
                  style === 'sun-moon' || style === 'aurora' ? metalColours[metal] : undefined,
              }}
            >
              <div
                className={cn(
                  'h-full w-full overflow-hidden bg-charcoal',
                  silhouetteClass(opal.visual.silhouette)
                )}
                style={{ clipPath }}
              >
                <OpalFaceImage
                  opal={opal}
                  placement={placement}
                  alt=""
                  sizes="360px"
                  className="h-full w-full"
                />
              </div>
            </div>
            <span className="pointer-events-none absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-cream/15 bg-black-rich/80 px-3 py-2 text-[0.68rem] text-cream/85">
              <Move aria-hidden="true" className="h-3.5 w-3.5" /> Drag colour · arrows nudge
            </span>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
          <RangeControl
            label="Zoom"
            min={limits.scaleMin}
            max={limits.scaleMax}
            step={0.05}
            value={placement.opalScale}
            onChange={(value) => update('opalScale', value)}
          />
          <div className="grid gap-2">
            <span className="text-xs font-medium text-charcoal">Orientation</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                aria-label="Rotate opal left"
                onClick={() =>
                  update('opalRotation', clamp(placement.opalRotation - 15, -180, 180))
                }
                className="grid min-h-11 place-items-center rounded-lg border border-warm-grey text-charcoal transition-colors hover:border-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
              <output
                className="grid min-h-11 place-items-center rounded-lg bg-cream text-sm tabular-nums text-charcoal"
                aria-label={`Rotation ${placement.opalRotation}`}
              >
                {Math.round(placement.opalRotation)}°
              </output>
              <button
                type="button"
                aria-label="Rotate opal right"
                onClick={() =>
                  update('opalRotation', clamp(placement.opalRotation + 15, -180, 180))
                }
                className="grid min-h-11 place-items-center rounded-lg border border-warm-grey text-charcoal transition-colors hover:border-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
              >
                <RotateCw aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <details className="group border-t border-warm-grey/70 pt-3 sm:col-span-2">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible [&::-webkit-details-marker]:hidden">
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" /> Fine position
              <span className="ml-auto text-xs font-normal text-charcoal-light group-open:hidden">
                Optional
              </span>
            </summary>
            <div className="grid gap-x-5 gap-y-3 pb-2 pt-3 sm:grid-cols-2">
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
                label="Rotation"
                min={-limits.rotation}
                max={limits.rotation}
                step={5}
                value={placement.opalRotation}
                onChange={(value) => update('opalRotation', value)}
              />
            </div>
          </details>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm-grey/70 pt-3 sm:col-span-2">
            <p className="max-w-[37ch] text-[0.68rem] leading-4 text-charcoal-light">
              Visual guide only. Your maker confirms colour bar, inclusions, stability, and yield.
            </p>
            <button
              type="button"
              onClick={() => onChange(defaultOpalPlacement)}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-charcoal-light underline decoration-warm-grey underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              <ZoomIn aria-hidden="true" className="h-4 w-4" /> Recommended view
            </button>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
