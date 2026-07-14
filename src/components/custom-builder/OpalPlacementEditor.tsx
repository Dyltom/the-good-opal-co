'use client'

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useRef, useState } from 'react'
import { Move, RotateCcw, RotateCw, SlidersHorizontal, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  constrainPhotoPlacementRotation,
  getPhotoPlacementRotationLimit,
  getPhotoPlacementScaleMax,
} from '@/lib/custom-builder/photo-crop'
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
  scaleMin: 1,
} as const

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function roundPlacement(value: number): number {
  return Math.round(value * 1000) / 1000
}

function formatPosition(value: number, axis: 'horizontal' | 'vertical'): string {
  const amount = Math.round(clamp((Math.abs(value) / limits.position) * 100, 0, 100))
  if (amount === 0) return 'Centred'
  const direction =
    axis === 'horizontal' ? (value > 0 ? 'right' : 'left') : value > 0 ? 'down' : 'up'
  return `${amount}% ${direction}`
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
  disabled = false,
  label,
  max,
  min,
  onChange,
  step,
  value,
  valueText,
}: {
  disabled?: boolean
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  value: number
  valueText: string
}) {
  return (
    <label className="grid gap-2 text-xs font-medium text-charcoal">
      <span className="flex items-center justify-between gap-3">
        {label}
        <output className="font-normal tabular-nums text-charcoal-light">{valueText}</output>
      </span>
      <input
        type="range"
        aria-label={label}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full cursor-pointer accent-charcoal disabled:cursor-not-allowed disabled:opacity-45"
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
  const cropViewport = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const baseZoom = opal.visual.textureCrop?.zoom ?? 1
  const scaleMax = getPhotoPlacementScaleMax(baseZoom)
  const displayedScale = Math.min(placement.opalScale, scaleMax)
  const stoneAspect = 1 / opal.visual.aspectRatio
  const rotationLimit = getPhotoPlacementRotationLimit(stoneAspect, baseZoom, displayedScale)
  const displayedRotation = constrainPhotoPlacementRotation(
    stoneAspect,
    baseZoom,
    displayedScale,
    placement.opalRotation
  )
  const canAdjustPosition = scaleMax > limits.scaleMin
  const dragScale = Math.min(scaleMax, Math.max(displayedScale, 1.15))
  const isDefaultPlacement =
    placement.opalPositionX === defaultOpalPlacement.opalPositionX &&
    placement.opalPositionY === defaultOpalPlacement.opalPositionY &&
    placement.opalScale === defaultOpalPlacement.opalScale &&
    placement.opalRotation === defaultOpalPlacement.opalRotation
  const clipPath = cssSilhouetteClipPath(opal.visual.silhouette, opal.visual.contour)
  const bezelPadding = style === 'coral' ? 'p-[7px]' : style === 'gemini' ? 'p-[5px]' : 'p-[4px]'
  const seatPadding = style === 'coral' ? 'p-[3px]' : style === 'gemini' ? 'p-px' : 'p-[2px]'

  function update<K extends keyof OpalPlacement>(key: K, value: OpalPlacement[K]) {
    onChange({ ...placement, [key]: value })
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!canAdjustPosition || event.button !== 0) return
    const bounds =
      cropViewport.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    const dragPlacement = {
      ...placement,
      opalScale: dragScale,
    }
    drag.current = {
      ...dragPlacement,
      height: bounds.height,
      pointerId: event.pointerId,
      width: bounds.width,
      x: event.clientX,
      y: event.clientY,
    }
    if (dragScale !== placement.opalScale) onChange(dragPlacement)
    setIsDragging(true)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const start = drag.current
    if (!start || start.pointerId !== event.pointerId) return

    onChange({
      opalRotation: start.opalRotation,
      opalScale: start.opalScale,
      opalPositionX: roundPlacement(
        clamp(
          start.opalPositionX + ((event.clientX - start.x) / start.width) * limits.position * 2,
          -limits.position,
          limits.position
        )
      ),
      opalPositionY: roundPlacement(
        clamp(
          start.opalPositionY + ((event.clientY - start.y) / start.height) * limits.position * 2,
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
    if (!canAdjustPosition) return
    const delta = event.shiftKey ? 0.05 : 0.01
    const next = { ...placement, opalScale: dragScale }

    if (event.key === 'ArrowLeft') next.opalPositionX -= delta
    else if (event.key === 'ArrowRight') next.opalPositionX += delta
    else if (event.key === 'ArrowUp') next.opalPositionY -= delta
    else if (event.key === 'ArrowDown') next.opalPositionY += delta
    else return

    event.preventDefault()
    next.opalPositionX = roundPlacement(
      clamp(next.opalPositionX, -limits.position, limits.position)
    )
    next.opalPositionY = roundPlacement(
      clamp(next.opalPositionY, -limits.position, limits.position)
    )
    onChange(next)
  }

  return (
    <fieldset>
      <legend className="font-serif text-xl font-medium">4. Frame the opal colour</legend>
      <p className="mt-2 max-w-[62ch] text-sm leading-6 text-charcoal-light">
        Move the exact listing photo inside its measured outline. The stone and setting stay fixed;
        only the colour framing in this concept changes.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-warm-grey/80 bg-white shadow-[0_10px_30px_rgb(31_30_25/0.06)]">
        <div className="grid gap-5 bg-[#171714] p-4 text-cream sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-opal-light">
                Colour workbench
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-cream/75">{opal.name}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span className="rounded-full border border-cream/20 px-3 py-1 text-xs text-cream/75">
                {opal.visual.photoFit === 'reviewed' ? 'Reviewed source photo' : 'Auto-fitted photo'}
              </span>
              <span className="rounded-full border border-cream/20 px-3 py-1 text-xs text-cream/75">
                {styleLabels[style]}
              </span>
            </div>
          </div>

          <div className="relative grid min-h-[20rem] select-none place-items-center gap-5 overflow-hidden rounded-lg border border-cream/10 bg-[radial-gradient(circle_at_50%_42%,rgb(255_255_255/0.09),transparent_55%)] px-8 py-7 sm:min-h-[24rem] sm:px-10">
            <div
              data-opal-placement-aperture
              role="group"
              tabIndex={canAdjustPosition ? 0 : -1}
              aria-disabled={!canAdjustPosition}
              aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown"
              aria-roledescription="opal photo crop"
              aria-label={`Adjust the photo crop for ${opal.name}. ${canAdjustPosition ? 'Drag the colour inside the fixed stone outline. The editor adds enough zoom to keep the photographed face inside the stone. Arrow keys nudge it; Shift plus an arrow makes a larger move.' : 'This source photo already uses the closest safe fit.'} Horizontal ${formatPosition(placement.opalPositionX, 'horizontal')}, vertical ${formatPosition(placement.opalPositionY, 'vertical')}.`}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onLostPointerCapture={stopDrag}
              onKeyDown={nudge}
              className={cn(
                'group relative mx-auto w-[70%] max-w-[15.5rem] touch-none drop-shadow-[0_18px_24px_rgb(0_0_0/0.5)] focus-visible:outline-none sm:w-[54%]',
                isDragging
                  ? 'cursor-grabbing'
                  : canAdjustPosition
                    ? 'cursor-grab'
                    : 'cursor-default'
              )}
              style={{
                aspectRatio: 1 / opal.visual.aspectRatio,
              }}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-charcoal shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25),0_12px_30px_rgb(0_0_0/0.5)] group-focus-visible:drop-shadow-[0_0_6px_rgb(129_221_231/0.95)]',
                  bezelPadding,
                  silhouetteClass(opal.visual.silhouette)
                )}
                style={{ backgroundColor: metalColours[metal], clipPath }}
              >
                <div
                  data-opal-setting-seat={style}
                  className={cn(
                    'relative h-full w-full bg-[#252622]',
                    seatPadding,
                    silhouetteClass(opal.visual.silhouette)
                  )}
                  style={{ clipPath }}
                >
                  <div
                    ref={cropViewport}
                    data-opal-placement-crop-viewport
                    className={cn(
                      'relative h-full w-full overflow-hidden bg-charcoal',
                      silhouetteClass(opal.visual.silhouette)
                    )}
                    style={{ clipPath }}
                  >
                    <OpalFaceImage
                      opal={opal}
                      placement={{ ...placement, opalRotation: displayedRotation }}
                      alt=""
                      eager
                      sizes="360px"
                      className="h-full w-full"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute inset-0 z-10 transition-opacity',
                        isDragging
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-75 group-focus-visible:opacity-100'
                      )}
                    >
                      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cream/45" />
                      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cream/45" />
                      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cream/70 bg-black-rich/25" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <output
              aria-live="polite"
              className="pointer-events-none inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-cream/15 bg-black-rich/80 px-3 py-2 text-xs text-cream/85"
            >
              <Move aria-hidden="true" className="h-3.5 w-3.5" />{' '}
              {canAdjustPosition
                ? `${isDragging ? 'Framing colour' : 'Drag colour inside outline'} · ${formatPosition(placement.opalPositionX, 'horizontal')} · ${formatPosition(placement.opalPositionY, 'vertical')}`
                : 'Closest safe source fit'}
            </output>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-5">
          <RangeControl
            label="Zoom"
            min={limits.scaleMin}
            max={scaleMax}
            step={0.05}
            value={displayedScale}
            valueText={`${displayedScale.toFixed(2)}×`}
            disabled={scaleMax <= limits.scaleMin}
            onChange={(value) =>
              onChange({
                ...placement,
                opalScale: value,
                opalRotation: constrainPhotoPlacementRotation(
                  stoneAspect,
                  baseZoom,
                  value,
                  placement.opalRotation
                ),
                ...(placement.opalScale <= limits.scaleMin || value === limits.scaleMin
                  ? { opalPositionX: 0, opalPositionY: 0 }
                  : {}),
              })
            }
          />
          <div className="grid gap-2">
            <span className="text-xs font-medium text-charcoal">Colour orientation</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                aria-label="Rotate opal colour left"
                disabled={displayedRotation <= -rotationLimit}
                onClick={() =>
                  update(
                    'opalRotation',
                    clamp(displayedRotation - 15, -rotationLimit, rotationLimit)
                  )
                }
                className="grid min-h-11 place-items-center rounded-lg border border-warm-grey text-charcoal transition-colors hover:border-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
              <output
                className="grid min-h-11 place-items-center rounded-lg bg-cream text-sm tabular-nums text-charcoal"
                aria-label={`Rotation ${displayedRotation}`}
              >
                {Math.round(displayedRotation)}°
              </output>
              <button
                type="button"
                aria-label="Rotate opal colour right"
                disabled={displayedRotation >= rotationLimit}
                onClick={() =>
                  update(
                    'opalRotation',
                    clamp(displayedRotation + 15, -rotationLimit, rotationLimit)
                  )
                }
                className="grid min-h-11 place-items-center rounded-lg border border-warm-grey text-charcoal transition-colors hover:border-charcoal/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible disabled:cursor-not-allowed disabled:opacity-40"
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
                disabled={!canAdjustPosition}
                label="Horizontal"
                min={-limits.position}
                max={limits.position}
                step={0.01}
                value={placement.opalPositionX}
                valueText={formatPosition(placement.opalPositionX, 'horizontal')}
                onChange={(value) =>
                  onChange({ ...placement, opalPositionX: value, opalScale: dragScale })
                }
              />
              <RangeControl
                disabled={!canAdjustPosition}
                label="Vertical"
                min={-limits.position}
                max={limits.position}
                step={0.01}
                value={placement.opalPositionY}
                valueText={formatPosition(placement.opalPositionY, 'vertical')}
                onChange={(value) =>
                  onChange({ ...placement, opalPositionY: value, opalScale: dragScale })
                }
              />
              <RangeControl
                label="Rotation"
                min={-rotationLimit}
                max={rotationLimit}
                step={5}
                value={displayedRotation}
                valueText={`${Math.round(displayedRotation)}°`}
                disabled={rotationLimit === 0}
                onChange={(value) => update('opalRotation', value)}
              />
            </div>
          </details>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm-grey/70 pt-3 sm:col-span-2">
            <p className="max-w-[37ch] text-xs leading-4 text-charcoal-light">
              Visual guide only. Your maker confirms colour bar, inclusions, stability, and yield.
            </p>
            <button
              type="button"
              disabled={isDefaultPlacement}
              onClick={() => onChange(defaultOpalPlacement)}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-charcoal-light underline decoration-warm-grey underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible disabled:cursor-not-allowed disabled:no-underline disabled:opacity-45"
            >
              <Undo2 aria-hidden="true" className="h-4 w-4" /> Reset photo crop
            </button>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
