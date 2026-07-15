'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ExternalLink, RotateCcw, Share2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { getPhotoPlacementScaleMax } from '@/lib/custom-builder/photo-crop'
import {
  applyRingStyle,
  defaultOpalPlacement,
  describeRingConfig,
  getRingStyleFit,
  metals,
  mergeRingConfigSearchParams,
  ringStyles,
  shapeForOpal,
} from './config'
import type { BuilderOpal, ConfigOption, RingConfig, RingStyleOption } from './config'
import { OpalFaceImage } from './OpalFaceImage'
import { OpalPlacementEditor } from './OpalPlacementEditor'
import { ViewerErrorBoundary } from './ViewerErrorBoundary'

const RingPreview = dynamic(() => import('./RingPreview').then((module) => module.RingPreview), {
  ssr: false,
  loading: () => (
    <div className="aspect-[4/5] min-h-[28rem] animate-pulse bg-black-rich sm:aspect-[5/4] lg:aspect-auto lg:h-full lg:min-h-0" />
  ),
})

interface RingConfiguratorProps {
  approvedProceduralStyles?: readonly RingConfig['style'][]
  initialConfig: RingConfig
  opals: readonly BuilderOpal[]
  unavailableOpalRequested?: boolean
}

interface OptionGroupProps<K extends keyof RingConfig> {
  label: string
  configKey: K
  options: readonly ConfigOption<Extract<RingConfig[K], string>>[]
  value: RingConfig[K]
  onChange: (key: K, value: RingConfig[K]) => void
}

function designUrlForConfig(config: RingConfig): URL {
  const url = new URL(window.location.href)
  url.search = mergeRingConfigSearchParams(url.searchParams, config).toString()
  return url
}

function OptionGroup<K extends keyof RingConfig>({
  label,
  configKey,
  options,
  value,
  onChange,
}: OptionGroupProps<K>) {
  return (
    <fieldset>
      <legend className="font-serif text-xl font-medium">{label}</legend>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(configKey, option.id as RingConfig[K])}
              className={cn(
                'relative min-h-[4.75rem] rounded-lg border p-3 text-left transition-[border-color,background-color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 active:scale-[0.98]',
                selected
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-warm-grey/80 bg-white hover:border-charcoal/50'
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {option.colour && (
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: option.colour }}
                  />
                )}
                {option.label}
                {selected && <Check aria-hidden="true" className="ml-auto h-4 w-4" />}
              </span>
              <span
                className={cn(
                  'mt-1 block text-xs leading-5',
                  selected ? 'text-cream/65' : 'text-charcoal-light'
                )}
              >
                {option.detail}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function OpalPicker({
  opals,
  selectedId,
  onSelect,
  onClear,
}: {
  opals: readonly BuilderOpal[]
  selectedId?: string
  onSelect: (opal: BuilderOpal) => void
  onClear: () => void
}) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<'all' | BuilderOpal['selectionKind']>(() => {
    const selected = opals.find((opal) => opal.id === selectedId)
    return selected?.selectionKind ?? 'individual'
  })
  const [visibleCount, setVisibleCount] = useState(12)
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase())
  const kindCounts = useMemo(
    () =>
      opals.reduce(
        (counts, opal) => ({
          ...counts,
          [opal.selectionKind]: counts[opal.selectionKind] + 1,
        }),
        { individual: 0, assortment: 0, parcel: 0, specimen: 0 }
      ),
    [opals]
  )
  const matchingOpals = useMemo(
    () =>
      opals.filter(
        (opal) =>
          (Boolean(deferredQuery) || kind === 'all' || opal.selectionKind === kind) &&
          (!deferredQuery ||
            `${opal.name} ${opal.stoneTypeLabel} ${opal.originLabel ?? ''}`
              .toLocaleLowerCase()
              .includes(deferredQuery))
      ),
    [deferredQuery, kind, opals]
  )
  const selectedIndex = matchingOpals.findIndex((opal) => opal.id === selectedId)
  const orderedOpals = useMemo(() => {
    if (selectedIndex <= 0) return matchingOpals
    const selected = matchingOpals[selectedIndex]
    return selected
      ? [selected, ...matchingOpals.filter((opal) => opal.id !== selected.id)]
      : matchingOpals
  }, [matchingOpals, selectedIndex])
  const visibleOpals = orderedOpals.slice(0, visibleCount)
  const remainingOpalCount = Math.max(0, matchingOpals.length - visibleCount)
  const nextOpalCount = Math.min(12, remainingOpalCount)

  useEffect(() => {
    setVisibleCount(12)
  }, [deferredQuery, kind])

  if (opals.length === 0) {
    return (
      <div className="border-y border-warm-grey/60 py-5 text-sm leading-6 text-charcoal-light">
        Available loose opals could not be loaded. Continue with a visual stone guide and we will
        match a real opal during consultation.
      </div>
    )
  }

  return (
    <fieldset>
      <legend className="font-serif text-xl font-medium">3. Choose an available opal</legend>
      <p className="mt-2 text-sm leading-6 text-charcoal-light">
        Start with individual stones: their exact listing photo maps onto the preview. Every
        published, in-stock listing remains available. Parcels, calibrated sets, and specimens use a
        representative 3D concept; your consultation confirms the individual stone and whether it
        can be set safely.
      </p>
      <button
        type="button"
        aria-pressed={!selectedId}
        onClick={onClear}
        className={cn(
          'mt-4 inline-flex min-h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2',
          selectedId
            ? 'border-charcoal/25 bg-white text-charcoal hover:border-charcoal'
            : 'border-charcoal bg-charcoal text-cream'
        )}
      >
        Preview collection reference
      </button>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div>
          <label htmlFor="opal-search" className="sr-only">
            Search available opals
          </label>
          <input
            id="opal-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, type, or origin"
            className="min-h-12 w-full rounded-lg border border-warm-grey bg-white px-4 text-sm text-charcoal placeholder:text-charcoal-light focus-visible:border-opal-electric-accessible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric/30"
          />
        </div>
        <div>
          <label htmlFor="opal-kind" className="sr-only">
            Filter available opals
          </label>
          <select
            id="opal-kind"
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as 'all' | BuilderOpal['selectionKind'])
            }
            className="min-h-12 w-full rounded-lg border border-warm-grey bg-white px-3 text-sm text-charcoal focus-visible:border-opal-electric-accessible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric/30"
          >
            <option value="all">All listings ({opals.length})</option>
            <option value="individual">Individual stones ({kindCounts.individual})</option>
            <option value="assortment">Calibrated sets ({kindCounts.assortment})</option>
            <option value="parcel">Parcels ({kindCounts.parcel})</option>
            <option value="specimen">Specimens ({kindCounts.specimen})</option>
          </select>
        </div>
      </div>
      <p className="mt-3 text-xs text-charcoal-light" aria-live="polite">
        {matchingOpals.length} {matchingOpals.length === 1 ? 'listing' : 'listings'} found
      </p>
      {matchingOpals.length === 0 ? (
        <div className="mt-4 border-y border-warm-grey/60 py-5 text-sm leading-6 text-charcoal-light">
          No available opals match those filters. Clear the search or choose another listing type.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {visibleOpals.map((opal) => {
            const selected = opal.id === selectedId
            const kindLabel = {
              individual: 'Individual stone',
              assortment: 'Choose from set',
              parcel: 'Whole parcel',
              specimen: 'Specimen',
            }[opal.selectionKind]
            return (
              <button
                key={opal.id}
                type="button"
                data-opal-id={opal.id}
                aria-pressed={selected}
                onClick={() => onSelect(opal)}
                className={cn(
                  'group overflow-hidden rounded-lg border bg-white text-left transition-[border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 active:scale-[0.99]',
                  selected
                    ? 'border-charcoal shadow-md'
                    : 'border-warm-grey/80 hover:border-charcoal/45'
                )}
              >
                <span className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#171714] p-4 sm:p-5">
                  <OpalFaceImage
                    opal={opal}
                    alt=""
                    clipToStone={opal.selectionKind === 'individual'}
                    sizes="(max-width: 640px) 36vw, 190px"
                    className={cn(
                      'h-[88%] w-auto shadow-[0_6px_18px_rgb(0_0_0/0.28)] transition-transform duration-300 ease-out group-hover:scale-[1.025]',
                      opal.selectionKind !== 'individual' && 'rounded-md'
                    )}
                  />
                  {selected && (
                    <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-charcoal text-cream shadow-sm">
                      <Check aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )}
                </span>
                <span className="block p-3">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-opal-electric-accessible">
                    {kindLabel}
                  </span>
                  <span className="line-clamp-2 block text-sm font-medium leading-5">
                    {opal.name}
                  </span>
                  <span className="mt-1 block text-xs text-charcoal-light">
                    {opal.stoneTypeLabel} · {formatCurrency(opal.price)} loose
                  </span>
                  {opal.visual.dimensionsMm && (
                    <span className="mt-1 block text-xs text-charcoal-light">
                      {opal.visual.dimensionsMm.width} × {opal.visual.dimensionsMm.length} ×{' '}
                      {opal.visual.dimensionsMm.depth} mm
                    </span>
                  )}
                  {opal.selectionKind !== 'individual' && (
                    <span className="mt-1 block text-xs leading-4 text-charcoal-light">
                      3D shows a representative setting concept
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
      {visibleCount < matchingOpals.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((current) => current + 12)}
          className="mt-4 inline-flex min-h-11 items-center rounded-full border border-charcoal/25 bg-white px-5 text-sm font-medium text-charcoal transition-colors hover:border-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
        >
          Show {nextOpalCount} more {nextOpalCount === 1 ? 'opal' : 'opals'}
        </button>
      )}
    </fieldset>
  )
}

function RingStylePicker({
  selectedOpal,
  value,
  onSelect,
}: {
  selectedOpal?: BuilderOpal
  value: RingConfig['style']
  onSelect: (style: RingStyleOption) => void
}) {
  const usesExactListingPhoto =
    selectedOpal?.selectionKind === 'individual' && Boolean(selectedOpal.visual.textureCrop)
  const mappingDescription = usesExactListingPhoto
    ? 'The preview maps the selected listing photo into the setting concept.'
    : selectedOpal
      ? 'This multi-stone listing uses a representative setting concept.'
      : 'Select an individual stone to map its listing photo into the setting concept.'

  return (
    <fieldset>
      <legend className="font-serif text-xl font-medium">2. Choose a collection design</legend>
      <p className="mt-2 text-sm leading-6 text-charcoal-light">
        Start with the design that suits the selected outline. Each reference is a photographed Good
        Opal Co ring; incompatible settings stay unavailable instead of stretching the stone into a
        misleading shape. {mappingDescription} Your maker confirms measurements, final seat, and
        whether the physical stone can be set safely.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {ringStyles.map((style) => {
          const selected = style.id === value
          const fit = selectedOpal ? getRingStyleFit(style.id, selectedOpal) : undefined
          const incompatible = fit?.kind === 'incompatible'
          const fitBadge =
            fit?.kind === 'original'
              ? 'Reference shape'
              : fit?.kind === 'concept'
                ? 'Concept fit'
                : fit?.kind === 'incompatible'
                  ? 'Not suitable'
                  : fit
                    ? 'Adapted'
                    : undefined
          return (
            <button
              key={style.id}
              type="button"
              aria-pressed={selected}
              disabled={incompatible}
              onClick={() => onSelect(style)}
              className={cn(
                'group overflow-hidden rounded-lg border bg-white text-left transition-[border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50',
                selected
                  ? 'border-charcoal shadow-md'
                  : 'border-warm-grey/80 hover:border-charcoal/45'
              )}
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-warm-grey/25">
                <Image
                  src={style.referenceImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, 240px"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                />
                {selected && (
                  <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-charcoal text-cream shadow-sm">
                    <Check aria-hidden="true" className="h-4 w-4" />
                  </span>
                )}
              </span>
              <span className="block p-3">
                <span className="flex items-start justify-between gap-2">
                  <span className="block text-sm font-medium">{style.label}</span>
                  {fitBadge && (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium uppercase tracking-[0.08em]',
                        fit?.kind === 'original'
                          ? 'bg-opal-emerald/10 text-opal-emerald-dark'
                          : 'bg-cream text-charcoal-light'
                      )}
                    >
                      {fitBadge}
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs leading-5 text-charcoal-light">
                  {style.detail}
                </span>
                {fit && (
                  <span className="mt-2 block text-xs leading-4 text-charcoal-light">
                    {fit.label}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function RingConfigurator({
  approvedProceduralStyles = [],
  initialConfig,
  opals,
  unavailableOpalRequested = false,
}: RingConfiguratorProps) {
  const [config, setConfig] = useState(() => {
    const initialOpal = opals.find((opal) => opal.id === initialConfig.opalId)
    if (!initialOpal || getRingStyleFit(initialConfig.style, initialOpal).kind !== 'incompatible') {
      return initialConfig
    }
    const styled = applyRingStyle(initialConfig, initialOpal.visual.recommendedStyle)
    return { ...styled, shape: shapeForOpal(initialOpal) }
  })
  const [shareStatus, setShareStatus] = useState('')
  const selectedOpal = useMemo(
    () => opals.find((opal) => opal.id === config.opalId),
    [config.opalId, opals]
  )
  const hasEditableOpalPhoto = Boolean(
    selectedOpal?.selectionKind === 'individual' &&
    selectedOpal.visual.photoFit === 'reviewed' &&
    selectedOpal.visual.textureCrop
  )
  const selectedCrop = selectedOpal?.visual.textureCrop
  const placementScaleMax = getPhotoPlacementScaleMax(
    selectedCrop?.zoom ?? 1,
    selectedOpal ? 1 / selectedOpal.visual.aspectRatio : 1,
    selectedCrop?.rotation ?? 0
  )
  useEffect(() => {
    if (!selectedOpal || getRingStyleFit(config.style, selectedOpal).kind !== 'incompatible') return
    setConfig((current) => {
      const styled = applyRingStyle(current, selectedOpal.visual.recommendedStyle)
      return { ...styled, shape: shapeForOpal(selectedOpal) }
    })
  }, [config.style, selectedOpal])
  useEffect(() => {
    if (!hasEditableOpalPhoto) return
    setConfig((current) => {
      if (current.opalScale <= placementScaleMax) return current
      return {
        ...current,
        opalScale: placementScaleMax,
        ...(placementScaleMax === 1 ? { opalPositionX: 0, opalPositionY: 0 } : {}),
      }
    })
  }, [hasEditableOpalPhoto, placementScaleMax])
  const description = useMemo(
    () => describeRingConfig(config, selectedOpal?.name),
    [config, selectedOpal?.name]
  )
  const referenceStyle = ringStyles.find((style) => style.id === config.style)
  const makerApproved =
    approvedProceduralStyles.includes(config.style) &&
    config.shape === referenceStyle?.shape &&
    config.setting === referenceStyle.setting &&
    config.band === referenceStyle.band &&
    (!selectedOpal || getRingStyleFit(config.style, selectedOpal).kind === 'original')
  const isStartingDesign = useMemo(
    () => JSON.stringify(config) === JSON.stringify(initialConfig),
    [config, initialConfig]
  )

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const url = designUrlForConfig(config)
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    }, 80)
    return () => window.clearTimeout(timeout)
  }, [config])

  function updateConfig<K extends keyof RingConfig>(key: K, value: RingConfig[K]) {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  function selectOpal(opal: BuilderOpal) {
    setConfig((current) => {
      const next = {
        ...current,
        ...defaultOpalPlacement,
        opalId: opal.id,
        stone: opal.renderStone,
      }
      const styled = applyRingStyle(next, opal.visual.recommendedStyle)
      return { ...styled, shape: shapeForOpal(opal) }
    })
  }

  function clearOpal() {
    setConfig((current) =>
      applyRingStyle({ ...current, ...defaultOpalPlacement, opalId: undefined }, current.style)
    )
  }

  async function shareDesign() {
    const url = designUrlForConfig(config)
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Good Opal Co ring concept',
          text: description,
          url: url.toString(),
        })
        setShareStatus('Design shared.')
      } else {
        await navigator.clipboard.writeText(url.toString())
        setShareStatus('Design link copied.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      try {
        await navigator.clipboard.writeText(url.toString())
        setShareStatus('Design link copied.')
      } catch {
        setShareStatus('Could not copy automatically. Copy the address from your browser.')
      }
    }
  }

  const contactParams = new URLSearchParams({
    subject: 'custom-design',
    product: `Custom ring concept: ${description}`,
    message: `I created a custom ring concept and would like to discuss stone availability, final design, timing, and an exact quote.\n\nConcept: ${description}`,
    design: JSON.stringify(config),
  })

  return (
    <section aria-labelledby="builder-heading" className="border-y border-warm-grey/60 bg-cream">
      <div className="grid lg:grid-cols-[minmax(0,1.12fr)_minmax(25rem,0.88fr)]">
        <div className="min-w-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:self-start">
          <ViewerErrorBoundary>
            <RingPreview
              config={config}
              description={description}
              makerApproved={makerApproved}
              selectedOpal={selectedOpal}
            />
          </ViewerErrorBoundary>
        </div>

        <div className="px-5 py-12 sm:px-10 sm:py-16 lg:px-[clamp(2.5rem,5vw,5.5rem)] lg:py-20">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-medium text-opal-electric-accessible">Design studio</p>
            <h2
              id="builder-heading"
              className="mt-3 text-balance font-serif text-4xl font-medium leading-tight sm:text-5xl"
            >
              Shape an idea in real time.
            </h2>
            <p className="mt-4 max-w-[62ch] leading-7 text-charcoal-light">
              Explore proportion, colour, setting, and metal together. This preview starts the
              conversation; each natural opal and finished piece remains one of a kind.
            </p>

            {unavailableOpalRequested && (
              <p
                role="status"
                className="mt-6 border-y border-warm-grey/70 py-4 text-sm leading-6 text-charcoal"
              >
                The opal saved in this link is no longer available. We have not substituted a
                different stone. Choose another available opal below to continue.
              </p>
            )}

            <div className="mt-10 space-y-9">
              <OptionGroup
                label="1. Choose a metal"
                configKey="metal"
                options={metals}
                value={config.metal}
                onChange={updateConfig}
              />
              <p className="-mt-7 text-xs leading-5 text-charcoal-light">
                The collection references were made in sterling silver. Gold and platinum are
                bespoke material adaptations confirmed during consultation.
              </p>
              <RingStylePicker
                selectedOpal={selectedOpal}
                value={config.style}
                onSelect={(style) =>
                  setConfig((current) => {
                    const styled = applyRingStyle(current, style.id)
                    return selectedOpal ? { ...styled, shape: shapeForOpal(selectedOpal) } : styled
                  })
                }
              />
              <OpalPicker
                opals={opals}
                selectedId={config.opalId}
                onSelect={selectOpal}
                onClear={clearOpal}
              />

              {selectedOpal && hasEditableOpalPhoto && (
                <OpalPlacementEditor
                  metal={config.metal}
                  opal={selectedOpal}
                  style={config.style}
                  placement={{
                    opalPositionX: config.opalPositionX,
                    opalPositionY: config.opalPositionY,
                    opalScale: config.opalScale,
                    opalRotation: config.opalRotation,
                  }}
                  onChange={(placement) => setConfig((current) => ({ ...current, ...placement }))}
                />
              )}

              <fieldset>
                <legend className="font-serif text-xl font-medium">
                  {hasEditableOpalPhoto ? '5. Ring size (US)' : '4. Ring size (US)'}
                </legend>
                <div className="mt-3 flex items-center gap-4">
                  <select
                    value={config.size}
                    onChange={(event) => updateConfig('size', Number(event.target.value))}
                    className="min-h-12 w-36 rounded-lg border border-warm-grey bg-white px-4 text-charcoal focus-visible:border-opal-electric-accessible focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric/30"
                    aria-label="US ring size concept"
                  >
                    {[
                      4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5,
                      13,
                    ].map((size) => (
                      <option key={size} value={size}>
                        Size {size}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm leading-6 text-charcoal-light">
                    Know an AU or UK letter size instead? Add it to your enquiry. We confirm sizing
                    before making.
                  </p>
                </div>
              </fieldset>
            </div>

            <div className="mt-12 border-y border-charcoal/20 py-7" aria-live="polite">
              <p className="text-sm text-charcoal-light">Your concept</p>
              <p className="mt-2 font-serif text-2xl leading-tight">{description}</p>
              <div className="mt-5 border-t border-charcoal/10 pt-5">
                <p className="text-sm font-medium">Pricing follows the stone.</p>
                <p className="mt-1 max-w-[52ch] text-xs leading-5 text-charcoal-light">
                  Natural opal value, exact dimensions, metal weight, and final engineering
                  determine your AUD quote. Nothing is charged from this builder.
                </p>
              </div>
              {selectedOpal && (
                <Link
                  href={`/store/${selectedOpal.slug}`}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium underline decoration-warm-grey underline-offset-4 hover:decoration-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
                >
                  View selected loose opal <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </Link>
              )}
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Link
                href={`/contact?${contactParams.toString()}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-charcoal px-6 font-medium text-cream transition-colors hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
              >
                Request my design consultation <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={shareDesign}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-charcoal/25 bg-white px-5 font-medium text-charcoal transition-colors hover:border-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
              >
                <Share2 aria-hidden="true" className="h-4 w-4" /> Share
              </button>
            </div>
            <button
              type="button"
              onClick={() => setConfig(initialConfig)}
              disabled={isStartingDesign}
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-charcoal-light underline decoration-warm-grey underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" /> Restore starting design
            </button>
            <p className="mt-2 min-h-5 text-xs text-charcoal-light" aria-live="polite">
              {shareStatus}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
