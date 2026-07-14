'use client'

import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'
import { useMemo, useRef, useState } from 'react'
import { Move, RotateCcw, RotateCw, SlidersHorizontal, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPhotoPlacementScaleMax } from '@/lib/custom-builder/photo-crop'
import type { BuilderOpal, OpalPlacement, RingConfig } from './config'
import { defaultOpalPlacement, ringStyleGeometryProfiles } from './config'
import { OpalFaceImage } from './OpalFaceImage'
import {
  applyHandmadeBeadVariation,
  cssSilhouetteClipPath,
  evenlySpacedOutlinePoints,
  getStyleBeadCount,
} from './geometry'

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
  scaleMin: 1,
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

const patinaColours: Record<RingConfig['metal'], string> = {
  'sterling-silver': '#2c2d29',
  '14k-gold': '#6b4b22',
  '18k-gold': '#6b4b22',
  'white-gold': '#575a59',
  'rose-gold': '#704a42',
  platinum: '#575a59',
}

const styleLabels: Record<RingConfig['style'], string> = {
  aurora: 'Aurora halo',
  coral: 'Coral clean bezel',
  gemini: 'Gemini clean bezel',
  'sun-moon': 'Sun & Moon beaded trim',
}

function OpalSettingDecoration({
  aspectRatio,
  clipPath,
  metal,
  opal,
  style,
}: {
  aspectRatio: number
  clipPath?: string
  metal: RingConfig['metal']
  opal: BuilderOpal
  style: RingConfig['style']
}) {
  const profile = ringStyleGeometryProfiles[style]
  const width = 0.4
  const height = width * aspectRatio
  const beadCount = getStyleBeadCount(
    style,
    opal.visual.silhouette,
    width,
    height,
    opal.visual.contour
  )
  const beads = useMemo(
    () =>
      applyHandmadeBeadVariation(
        evenlySpacedOutlinePoints(
          opal.visual.silhouette,
          width,
          height,
          profile.haloOffset,
          beadCount,
          profile.haloPhase,
          style,
          opal.visual.contour
        ),
        profile.beadVariation,
        profile.beadFlattening,
        profile.beadAsymmetry
      ),
    [
      beadCount,
      height,
      opal.visual.contour,
      opal.visual.silhouette,
      profile.beadFlattening,
      profile.beadAsymmetry,
      profile.beadVariation,
      profile.haloOffset,
      profile.haloPhase,
      style,
    ]
  )

  if (beads.length === 0) return null

  const supportInset = `${(profile.haloOffset / width) * 38}%`
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0"
      data-opal-setting-decoration={style}
    >
      <span
        data-opal-setting-support
        className={cn(
          'absolute shadow-[0_8px_18px_rgb(0_0_0/0.42)]',
          silhouetteClass(opal.visual.silhouette)
        )}
        style={{
          background: `linear-gradient(145deg, ${patinaColours[metal]}, #20211e 72%)`,
          clipPath,
          inset: `-${supportInset}`,
        }}
      />
      {beads.map(({ key, rotation, size, stretchX, stretchY, x, y }) => {
        const diameter = (profile.beadRadius / width) * 100
        return (
          <span
            key={key}
            data-opal-setting-grain
            className={cn(
              'absolute block -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_34%_28%,#f3f1e9_0%,#b6b5ae_34%,#585954_70%,#262722_100%)] shadow-[0_1px_2px_rgb(0_0_0/0.75)]',
              profile.beadShape === 'angular' ? 'rounded-[38%]' : 'rounded-full'
            )}
            style={{
              height: `${diameter}%`,
              left: `${50 + (x / (width * 2)) * 100}%`,
              top: `${50 - (y / (height * 2)) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}rad) scale(${size * stretchX}, ${size * stretchY})`,
              width: `${diameter}%`,
            }}
          />
        )
      })}
    </span>
  )
}

function RangeControl({
  disabled = false,
  label,
  max,
  min,
  onChange,
  step,
  value,
}: {
  disabled?: boolean
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
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        value={value}
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
  const aperture = useRef<HTMLDivElement>(null)
  const drag = useRef<DragState | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const baseZoom = opal.visual.textureCrop?.zoom ?? 1
  const scaleMax = getPhotoPlacementScaleMax(baseZoom)
  const displayedScale = Math.min(placement.opalScale, scaleMax)
  const canPan = displayedScale > limits.scaleMin && scaleMax > limits.scaleMin
  const clipPath = cssSilhouetteClipPath(opal.visual.silhouette, opal.visual.contour)
  const bezelPadding = style === 'coral' ? 'p-[7px]' : style === 'gemini' ? 'p-[5px]' : 'p-[4px]'
  const seatPadding = style === 'coral' ? 'p-[3px]' : style === 'gemini' ? 'p-px' : 'p-[2px]'

  function update<K extends keyof OpalPlacement>(key: K, value: OpalPlacement[K]) {
    onChange({ ...placement, [key]: value })
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!canPan) return
    const bounds =
      aperture.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect()
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
    if (!canPan) return
    const delta = event.shiftKey ? 0.05 : 0.01
    const next = { ...placement }

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
      <legend className="font-serif text-xl font-medium">4. Adjust the opal photo crop</legend>
      <p className="mt-2 max-w-[62ch] text-sm leading-6 text-charcoal-light">
        Slide the exact listing photo beneath the cut outline. This changes the colour shown in the
        concept, not the physical stone or setting engineering.
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
            <div className="flex flex-wrap justify-end gap-2">
              <span className="rounded-full border border-cream/20 px-3 py-1 text-[0.68rem] text-cream/75">
                {opal.visual.photoFit === 'reviewed' ? 'Reviewed photo crop' : 'Auto-fitted colour'}
              </span>
              <span className="rounded-full border border-cream/20 px-3 py-1 text-[0.68rem] text-cream/75">
                {styleLabels[style]}
              </span>
            </div>
          </div>

          <div className="relative grid min-h-[20rem] select-none place-items-center overflow-hidden rounded-lg border border-cream/10 bg-[radial-gradient(circle_at_center,rgb(255_255_255/0.075),transparent_58%)] p-8 sm:min-h-[24rem]">
            <div
              ref={aperture}
              data-opal-placement-aperture
              role="group"
              tabIndex={canPan ? 0 : -1}
              aria-disabled={!canPan}
              aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown Shift+ArrowLeft Shift+ArrowRight Shift+ArrowUp Shift+ArrowDown"
              aria-roledescription="opal photo crop"
              aria-label={`Adjust the photo crop for ${opal.name}. ${canPan ? 'Drag to move the colour. Arrow keys nudge by one percent; Shift plus an arrow nudges by five percent.' : 'Increase zoom above one to reposition the colour.'} Horizontal ${placement.opalPositionX.toFixed(2)}, vertical ${placement.opalPositionY.toFixed(2)}.`}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              onLostPointerCapture={stopDrag}
              onKeyDown={nudge}
              className={cn(
                'group relative mx-auto w-[58%] touch-none drop-shadow-[0_18px_24px_rgb(0_0_0/0.5)] focus-visible:outline-none sm:w-[52%]',
                isDragging ? 'cursor-grabbing' : canPan ? 'cursor-grab' : 'cursor-default'
              )}
              style={{
                aspectRatio: 1 / opal.visual.aspectRatio,
              }}
            >
              <OpalSettingDecoration
                aspectRatio={opal.visual.aspectRatio}
                clipPath={clipPath}
                metal={metal}
                opal={opal}
                style={style}
              />
              <div
                className={cn(
                  'absolute inset-0 z-10 bg-charcoal shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)] group-focus-visible:drop-shadow-[0_0_5px_rgb(129_221_231/0.95)]',
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
                    className={cn(
                      'relative h-full w-full overflow-hidden bg-charcoal',
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
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none absolute inset-0 z-10 transition-opacity',
                        isDragging ? 'opacity-100' : 'opacity-0'
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
              className="pointer-events-none absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-cream/15 bg-black-rich/80 px-3 py-2 text-[0.68rem] text-cream/85"
            >
              <Move aria-hidden="true" className="h-3.5 w-3.5" />{' '}
              {canPan
                ? `X ${placement.opalPositionX.toFixed(2)} · Y ${placement.opalPositionY.toFixed(2)}`
                : scaleMax > limits.scaleMin
                  ? 'Zoom to reposition'
                  : 'Maximum photo detail'}
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
            disabled={scaleMax <= limits.scaleMin}
            onChange={(value) =>
              onChange({
                ...placement,
                opalScale: value,
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
                aria-label="Rotate opal colour right"
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
                disabled={!canPan}
                label="Horizontal"
                min={-limits.position}
                max={limits.position}
                step={0.01}
                value={placement.opalPositionX}
                onChange={(value) => update('opalPositionX', value)}
              />
              <RangeControl
                disabled={!canPan}
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
              <ZoomIn aria-hidden="true" className="h-4 w-4" /> Reset photo crop
            </button>
          </div>
        </div>
      </div>
    </fieldset>
  )
}
