'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ExternalLink, RotateCcw, Share2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { getPhotoPlacementScaleMax } from '@/lib/custom-builder/photo-crop'
import { getBuilderOpalPhotoSource } from '@/lib/custom-builder/opal-photo-source'
import type { RingDesignRenderManifest } from '@/lib/custom-builder/ring-design-manifest'
import { selectRingRenderModel } from '@/lib/custom-builder/ring-render-model'
import { estimateRingPrice, formatWholeDollars } from '@/lib/custom-builder/pricing'
import type { MetalSpot } from '@/lib/custom-builder/pricing'
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
import { getRenderedStoneAspect } from './geometry'

const RingPreview = dynamic(() => import('./RingPreview').then((module) => module.RingPreview), {
  ssr: false,
  loading: () => (
    <div className="h-[36svh] min-h-[16rem] animate-pulse bg-[#eae6de] sm:aspect-[5/4] sm:h-auto sm:min-h-0 lg:aspect-auto lg:h-full" />
  ),
})

interface RingConfiguratorProps {
  initialConfig: RingConfig
  metalSpot: MetalSpot
  opals: readonly BuilderOpal[]
  ringDesignManifests?: readonly RingDesignRenderManifest[]
  unavailableOpalRequested?: boolean
}

interface OptionGroupProps<K extends keyof RingConfig> {
  step: string
  note?: string
  label: string
  configKey: K
  options: readonly ConfigOption<Extract<RingConfig[K], string>>[]
  value: RingConfig[K]
  onChange: (key: K, value: RingConfig[K]) => void
}

const kindLabels: Record<BuilderOpal['selectionKind'], string> = {
  individual: 'Individual stone',
  assortment: 'Choose from set',
  parcel: 'Whole parcel',
  specimen: 'Specimen',
}

function designUrlForConfig(config: RingConfig): URL {
  const url = new URL(window.location.href)
  url.search = mergeRingConfigSearchParams(url.searchParams, config).toString()
  return url
}

function StepLegend({ step, children }: { step: string; children: ReactNode }) {
  return (
    <legend className="flex items-baseline gap-2 font-serif text-lg font-medium text-ink">
      <span aria-hidden="true" className="font-sans text-xs font-semibold text-accent">
        {step}
      </span>
      {children}
    </legend>
  )
}

function OptionGroup<K extends keyof RingConfig>({
  step,
  label,
  configKey,
  options,
  value,
  onChange,
  note,
}: OptionGroupProps<K>) {
  const selectedOption = options.find((option) => option.id === value)
  return (
    <fieldset>
      <StepLegend step={step}>{label}</StepLegend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(configKey, option.id as RingConfig[K])}
              className={cn(
                'inline-flex min-h-10 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm transition-[border-color,background-color,color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97]',
                selected
                  ? 'border-ink bg-ink text-bg'
                  : 'border-rule bg-bg text-ink hover:border-rule-2'
              )}
            >
              {option.colour && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-7 w-7 shrink-0 rounded-full shadow-[inset_0_-3px_6px_rgb(0_0_0/0.18),inset_0_3px_6px_rgb(255_255_255/0.55)]',
                    selected ? 'ring-1 ring-bg/40' : 'ring-1 ring-black/10'
                  )}
                  style={{ backgroundColor: option.colour }}
                />
              )}
              {option.label}
            </button>
          )
        })}
      </div>
      {(selectedOption || note) && (
        <p className="mt-2.5 text-xs leading-5 text-ink-2">
          {selectedOption?.detail}
          {selectedOption && note ? '. ' : ''}
          {note}
        </p>
      )}
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
    if (selected) return selected.selectionKind
    return opals.some((opal) => opal.selectionKind === 'individual') ? 'individual' : 'all'
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

  const selectedOpal = opals.find((opal) => opal.id === selectedId)

  if (opals.length === 0) {
    return (
      <div className="border-y border-rule py-5 text-sm leading-6 text-ink-2">
        Available loose opals could not be loaded. Continue with a visual stone guide and we will
        match a real opal during consultation.
      </div>
    )
  }

  return (
    <fieldset>
      <StepLegend step="03">Opal</StepLegend>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <div>
          <label htmlFor="opal-search" className="sr-only">
            Search available opals
          </label>
          <input
            id="opal-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search type or origin"
            className="min-h-11 w-full rounded-full border border-rule bg-bg px-4 text-sm text-ink placeholder:text-ink-2 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
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
            className="min-h-11 w-full max-w-[11rem] rounded-full border border-rule bg-bg px-3 text-sm text-ink focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
          >
            <option value="all">All listings ({opals.length})</option>
            <option value="individual">Individual stones ({kindCounts.individual})</option>
            <option value="assortment">Calibrated sets ({kindCounts.assortment})</option>
            <option value="parcel">Parcels ({kindCounts.parcel})</option>
            <option value="specimen">Specimens ({kindCounts.specimen})</option>
          </select>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-ink-2" aria-live="polite">
          {matchingOpals.length} {matchingOpals.length === 1 ? 'listing' : 'listings'} found
        </p>
        <button
          type="button"
          aria-pressed={!selectedId}
          onClick={onClear}
          className="inline-flex min-h-9 items-center rounded-full px-2 text-xs font-medium text-ink-2 underline decoration-ink-3 underline-offset-4 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent aria-pressed:text-ink aria-pressed:no-underline"
        >
          Preview collection reference
        </button>
      </div>
      {matchingOpals.length === 0 ? (
        <div className="mt-3 border-y border-rule py-5 text-sm leading-6 text-ink-2">
          No available opals match those filters. Clear the search or choose another listing type.
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5">
          {visibleOpals.map((opal) => {
            const selected = opal.id === selectedId
            return (
              <button
                key={opal.id}
                type="button"
                data-opal-id={opal.id}
                aria-pressed={selected}
                onClick={() => onSelect(opal)}
                title={`${opal.name} · ${formatCurrency(opal.price)} loose`}
                className={cn(
                  'group relative flex aspect-square items-center justify-center overflow-hidden rounded-sm border-2 bg-[#171714] p-2 transition-[border-color,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.96]',
                  selected ? 'border-bg' : 'border-transparent hover:border-bg/40'
                )}
              >
                <OpalFaceImage
                  opal={opal}
                  alt=""
                  clipToStone={opal.selectionKind === 'individual'}
                  sizes="96px"
                  className={cn(
                    'h-[82%] w-auto drop-shadow-[0_4px_10px_rgb(0_0_0/0.45)] transition-transform duration-300 ease-out group-hover:scale-[1.06]',
                    opal.selectionKind !== 'individual' && 'rounded-sm'
                  )}
                />
                <span className="sr-only">
                  {opal.name}, {opal.stoneTypeLabel}, {formatCurrency(opal.price)} loose.
                  {opal.selectionKind !== 'individual' && (
                    <span> Preview shows a representative stone</span>
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
          className="mt-3 inline-flex min-h-10 items-center rounded-full border border-rule bg-bg px-4 text-xs font-medium text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Show {nextOpalCount} more {nextOpalCount === 1 ? 'opal' : 'opals'}
        </button>
      )}
      {selectedOpal && (
        <div className="mt-3 rounded-sm border border-rule bg-bg px-3.5 py-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-accent">
            {kindLabels[selectedOpal.selectionKind]}
          </p>
          <p className="mt-1 text-sm font-medium leading-5">{selectedOpal.name}</p>
          <p className="mt-1 text-xs leading-5 text-ink-2">
            {selectedOpal.stoneTypeLabel} · {formatCurrency(selectedOpal.price)} loose
            {selectedOpal.visual.dimensionsMm
              ? ` · ${selectedOpal.visual.dimensionsMm.width} × ${selectedOpal.visual.dimensionsMm.length} × ${selectedOpal.visual.dimensionsMm.depth} mm`
              : selectedOpal.selectionKind === 'individual'
                ? ' · size estimated, confirmed at consultation'
                : ' · preview shows a representative stone'}
          </p>
          <Link
            href={`/store/${selectedOpal.slug}`}
            className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-xs font-medium underline decoration-ink-3 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View selected loose opal <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
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
    ? 'The preview uses this stone’s own photo.'
    : selectedOpal
      ? 'This multi-stone listing shows a representative stone.'
      : 'Choose an individual stone to see its own photo in the preview.'

  const selectedStyle = ringStyles.find((style) => style.id === value)
  const selectedFit = selectedOpal ? getRingStyleFit(value, selectedOpal) : undefined

  return (
    <fieldset>
      <StepLegend step="02">Design</StepLegend>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {ringStyles.map((style) => {
          const selected = style.id === value
          const fit = selectedOpal ? getRingStyleFit(style.id, selectedOpal) : undefined
          const incompatible = fit?.kind === 'incompatible'
          const fitBadge =
            fit?.kind === 'original'
              ? 'Reference shape'
              : fit?.kind === 'concept'
                ? 'Good fit'
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
              className="group min-w-0 text-left focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span
                className={cn(
                  'relative block aspect-square overflow-hidden rounded-sm border-2 bg-plinth transition-[border-color,transform] duration-200 ease-out group-focus-visible:ring-2 group-focus-visible:ring-accent group-focus-visible:ring-offset-2 group-enabled:group-active:scale-[0.96]',
                  selected
                    ? 'border-ink'
                    : 'border-transparent group-enabled:group-hover:border-rule'
                )}
              >
                <Image
                  src={style.referenceImage}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 22vw, 110px"
                  className="rounded-[6px] object-cover transition-transform duration-300 ease-out group-enabled:group-hover:scale-[1.05]"
                />
              </span>
              <span className="mt-1.5 block truncate text-xs font-medium">{style.label}</span>
              {fitBadge && (
                <span
                  className={cn(
                    'block truncate text-[0.68rem] leading-4',
                    fit?.kind === 'original'
                      ? 'text-success'
                      : incompatible
                        ? 'text-ink-2 line-through'
                        : 'text-ink-2'
                  )}
                >
                  {fitBadge}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <p className="mt-2.5 text-xs leading-5 text-ink-2">
        {selectedStyle ? `${selectedStyle.label}: ${selectedStyle.detail}.` : ''}{' '}
        {selectedFit ? `${selectedFit.label}. ` : ''}
        {mappingDescription} Each design is a photographed Good Opal Co ring; we confirm fit at your
        consultation.
      </p>
    </fieldset>
  )
}

export function RingConfigurator({
  initialConfig,
  metalSpot,
  opals,
  ringDesignManifests = [],
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
  const selectedPhotoSource = selectedOpal ? getBuilderOpalPhotoSource(selectedOpal) : undefined
  const hasEditableOpalPhoto = Boolean(
    selectedOpal?.selectionKind === 'individual' &&
    selectedOpal.visual.photoFit === 'reviewed' &&
    selectedPhotoSource?.crop
  )
  const selectedCrop = selectedPhotoSource?.crop
  const placementScaleMax = getPhotoPlacementScaleMax(
    selectedCrop?.zoom ?? 1,
    selectedOpal ? getRenderedStoneAspect({ shape: config.shape }, selectedOpal) : 1,
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
  const renderModel = useMemo(
    () =>
      selectRingRenderModel({
        config,
        manifest: ringDesignManifests.find((manifest) => manifest.style === config.style),
        opal: selectedOpal,
      }),
    [config, ringDesignManifests, selectedOpal]
  )
  const selectedStyle = ringStyles.find((style) => style.id === config.style) ?? ringStyles[0]!
  const ringPrice = estimateRingPrice(config, metalSpot)
  const opalPrice = selectedOpal && selectedOpal.price > 0 ? selectedOpal.price : undefined
  const estimate =
    ringPrice === null
      ? 'Platinum is quoted individually'
      : opalPrice
        ? `Estimate ${formatWholeDollars(ringPrice + opalPrice)}: ring ${formatWholeDollars(ringPrice)} + opal ${formatWholeDollars(opalPrice)}`
        : `Ring ${formatWholeDollars(ringPrice)}, plus the opal you choose`
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
    message: `I created a custom ring concept and would like to discuss stone availability, final design, timing, and an exact quote.\n\nConcept: ${description}\n\nBuilder estimate: ${estimate} (AUD)`,
    design: JSON.stringify(config),
  })
  const viewerResetKey = JSON.stringify([
    selectedOpal?.id ?? 'reference-opal',
    config.style,
    config.metal,
    renderModel,
  ])

  return (
    <section aria-labelledby="builder-heading" className="bg-bg">
      <div className="grid lg:h-[calc(100svh-5rem)] lg:min-h-[36rem] lg:grid-cols-[minmax(0,1fr)_minmax(26rem,30rem)] xl:grid-cols-[minmax(0,1fr)_33rem]">
        <div className="sticky top-[52px] z-20 min-w-0 self-start shadow-[0_8px_24px_rgb(31_30_25/0.12)] sm:static sm:shadow-none lg:h-full">
          <ViewerErrorBoundary resetKey={viewerResetKey}>
            <RingPreview
              config={config}
              description={description}
              reference={{
                image: selectedStyle.referenceImage,
                name: selectedStyle.referenceName,
              }}
              renderModel={renderModel}
              selectedOpal={selectedOpal}
            />
          </ViewerErrorBoundary>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col lg:border-l lg:border-rule">
          <div className="flex-1 px-5 pb-8 pt-5 sm:px-8 lg:overflow-y-auto lg:overscroll-contain lg:pt-6">
            <Link
              href="/services"
              className="-ml-1 inline-flex min-h-9 items-center gap-1.5 rounded-sm px-1 text-xs text-ink-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Custom jewellery
            </Link>
            <h1
              id="builder-heading"
              className="text-balance font-serif text-3xl font-medium leading-tight sm:text-4xl"
            >
              Design your opal ring
            </h1>
            <p className="mt-2 max-w-[48ch] text-sm leading-6 text-ink-2">
              Pick a metal, one of our designs and a real opal from the shop. We quote the finished
              ring before anything is made.
            </p>

            {unavailableOpalRequested && (
              <p
                role="status"
                className="mt-5 rounded-sm border border-rule bg-bg px-4 py-3 text-sm leading-6 text-ink"
              >
                The opal saved in this link is no longer available. We have not substituted a
                different stone. Choose another available opal below to continue.
              </p>
            )}

            <div className="mt-5 divide-y divide-rule [&>*:first-child]:pt-2 [&>*]:py-6">
              <div>
                <OptionGroup
                  step="01"
                  label="Metal"
                  configKey="metal"
                  options={metals}
                  value={config.metal}
                  onChange={updateConfig}
                  note="Our reference rings are sterling silver; gold and platinum are made to order"
                />
              </div>
              <div>
                <RingStylePicker
                  selectedOpal={selectedOpal}
                  value={config.style}
                  onSelect={(style) =>
                    setConfig((current) => {
                      const styled = applyRingStyle(current, style.id)
                      return selectedOpal
                        ? { ...styled, shape: shapeForOpal(selectedOpal) }
                        : styled
                    })
                  }
                />
              </div>
              <div>
                <OpalPicker
                  opals={opals}
                  selectedId={config.opalId}
                  onSelect={selectOpal}
                  onClear={clearOpal}
                />
              </div>

              {selectedOpal && hasEditableOpalPhoto && (
                <div>
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
                </div>
              )}

              <fieldset>
                <StepLegend step={hasEditableOpalPhoto ? '05' : '04'}>Ring size</StepLegend>
                <div className="mt-3 flex items-center gap-4">
                  <select
                    value={config.size}
                    onChange={(event) => updateConfig('size', Number(event.target.value))}
                    className="min-h-11 w-32 shrink-0 rounded-full border border-rule bg-bg px-4 text-sm text-ink focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    aria-label="US ring size concept"
                  >
                    {[
                      4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5,
                      13,
                    ].map((size) => (
                      <option key={size} value={size}>
                        US {size}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs leading-5 text-ink-2">
                    Know an AU or UK letter size instead? Add it to your enquiry. We confirm sizing
                    before making.
                  </p>
                </div>
              </fieldset>
            </div>

            <button
              type="button"
              onClick={() => setConfig(initialConfig)}
              disabled={isStartingDesign}
              className="inline-flex min-h-10 items-center gap-2 text-xs text-ink-2 underline decoration-ink-3 underline-offset-4 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Restore starting design
            </button>
          </div>

          <div
            data-bottom-bar
            className="sticky bottom-0 z-20 border-t border-rule bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/85 lg:static"
          >
            <div className="px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-8 lg:py-4">
              <p
                aria-live="polite"
                className="line-clamp-1 font-serif text-base leading-snug sm:text-lg lg:line-clamp-2"
              >
                <span className="sr-only">Your concept: </span>
                {description}
              </p>
              <p className="mt-0.5 text-sm font-medium tabular-nums text-ink">{estimate}</p>
              <p className="hidden text-xs leading-5 text-ink-2 sm:block">
                {metalSpot.live ? "Metal follows today's gold and silver price. " : ''}AUD; your
                consultation confirms the final price and nothing is charged here.
              </p>
              <div className="mt-2.5 flex gap-2">
                <Link
                  href={`/contact?${contactParams.toString()}`}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-medium text-bg transition-colors hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:text-base"
                >
                  Request my design consultation{' '}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={shareDesign}
                  aria-label="Share this design"
                  className="inline-flex min-h-12 w-12 shrink-0 items-center justify-center rounded-full border border-rule bg-bg text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <Share2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
              <p className="min-h-0 text-xs text-ink-2 empty:hidden" aria-live="polite">
                {shareStatus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
