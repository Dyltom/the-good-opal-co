'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ExternalLink, RotateCcw, Share2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import {
  applyRingStyle,
  defaultOpalPlacement,
  describeRingConfig,
  isRingStyleCompatible,
  metals,
  ringStyles,
  shapeForOpal,
  ringConfigToSearchParams,
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
}: {
  opals: readonly BuilderOpal[]
  selectedId?: string
  onSelect: (opal: BuilderOpal) => void
}) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<'all' | BuilderOpal['selectionKind']>('all')
  const [visibleCount, setVisibleCount] = useState(12)
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase())
  const matchingOpals = useMemo(
    () =>
      opals.filter(
        (opal) =>
          (kind === 'all' || opal.selectionKind === kind) &&
          (!deferredQuery ||
            `${opal.name} ${opal.stoneTypeLabel} ${opal.originLabel ?? ''}`
              .toLocaleLowerCase()
              .includes(deferredQuery))
      ),
    [deferredQuery, kind, opals]
  )
  const selectedIndex = matchingOpals.findIndex((opal) => opal.id === selectedId)
  const effectiveVisibleCount = Math.max(visibleCount, selectedIndex >= 0 ? selectedIndex + 1 : 0)
  const visibleOpals = matchingOpals.slice(0, effectiveVisibleCount)

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
      <legend className="font-serif text-xl font-medium">2. Choose an available opal</legend>
      <p className="mt-2 text-sm leading-6 text-charcoal-light">
        Every published, in-stock loose-opal listing is shown. Product photos belong to the exact
        listing. Parcels, calibrated sets, and specimens use a representative 3D concept; your
        consultation confirms the individual stone and whether it can be set safely.
      </p>
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
            <option value="all">All listings</option>
            <option value="individual">Individual stones</option>
            <option value="assortment">Calibrated sets</option>
            <option value="parcel">Parcels</option>
            <option value="specimen">Specimens</option>
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
                    sizes="(max-width: 640px) 36vw, 190px"
                    className="h-[88%] w-auto rounded-md shadow-[0_6px_18px_rgb(0_0_0/0.28)] transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                  />
                  {selected && (
                    <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-charcoal text-cream shadow-sm">
                      <Check aria-hidden="true" className="h-4 w-4" />
                    </span>
                  )}
                </span>
                <span className="block p-3">
                  <span className="mb-1 block text-[0.65rem] font-medium uppercase tracking-[0.1em] text-opal-electric-accessible">
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
                    <span className="mt-1 block text-[0.65rem] leading-4 text-charcoal-light">
                      3D shows a representative setting concept
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}
      {effectiveVisibleCount < matchingOpals.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((current) => current + 12)}
          className="mt-4 inline-flex min-h-11 items-center rounded-full border border-charcoal/25 bg-white px-5 text-sm font-medium text-charcoal transition-colors hover:border-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
        >
          Show 12 more
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
  return (
    <fieldset>
      <legend className="font-serif text-xl font-medium">3. Choose a collection design</legend>
      <p className="mt-2 text-sm leading-6 text-charcoal-light">
        Each design comes from a photographed Good Opal Co ring previously made in sterling silver.
        The selected stone keeps its real silhouette while the bezel and halo treatment adapt around
        it.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {ringStyles.map((style) => {
          const selected = style.id === value
          const compatible = !selectedOpal || isRingStyleCompatible(style.id, selectedOpal)
          return (
            <button
              key={style.id}
              type="button"
              aria-pressed={selected}
              disabled={!compatible}
              onClick={() => onSelect(style)}
              className={cn(
                'group overflow-hidden rounded-lg border bg-white text-left transition-[border-color,box-shadow,transform,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45',
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
                <span className="block text-sm font-medium">{style.label}</span>
                <span className="mt-1 block text-xs leading-5 text-charcoal-light">
                  {compatible ? style.detail : `Requires a ${style.shape} opal`}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function RingConfigurator({
  initialConfig,
  opals,
  unavailableOpalRequested = false,
}: RingConfiguratorProps) {
  const [config, setConfig] = useState(initialConfig)
  const [shareStatus, setShareStatus] = useState('')
  const selectedOpal = useMemo(
    () => opals.find((opal) => opal.id === config.opalId),
    [config.opalId, opals]
  )
  const description = useMemo(
    () => describeRingConfig(config, selectedOpal?.name),
    [config, selectedOpal?.name]
  )

  useEffect(() => {
    const params = ringConfigToSearchParams(config)
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
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
      const styled =
        opal.visual.evidence === 'catalogue'
          ? applyRingStyle(next, opal.visual.recommendedStyle)
          : next
      return { ...styled, shape: shapeForOpal(opal) }
    })
  }

  async function shareDesign() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Good Opal Co ring concept', text: description, url })
        setShareStatus('Design shared.')
      } else {
        await navigator.clipboard.writeText(url)
        setShareStatus('Design link copied.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setShareStatus('Could not copy automatically. Copy the address from your browser.')
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
            <RingPreview config={config} description={description} selectedOpal={selectedOpal} />
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
              <OpalPicker opals={opals} selectedId={config.opalId} onSelect={selectOpal} />
              <RingStylePicker
                selectedOpal={selectedOpal}
                value={config.style}
                onSelect={(style) =>
                  setConfig((current) => ({
                    ...applyRingStyle(current, style.id),
                    ...(selectedOpal ? { shape: shapeForOpal(selectedOpal) } : {}),
                  }))
                }
              />

              {selectedOpal && (
                <OpalPlacementEditor
                  opal={selectedOpal}
                  placement={{
                    opalPositionX: config.opalPositionX,
                    opalPositionY: config.opalPositionY,
                    opalScale: config.opalScale,
                    opalRotation: config.opalRotation,
                  }}
                  onChange={(placement) =>
                    setConfig((current) => ({ ...current, ...placement }))
                  }
                />
              )}

              <fieldset>
                <legend className="font-serif text-xl font-medium">5. Ring size (US)</legend>
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
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm text-charcoal-light underline decoration-warm-grey underline-offset-4 hover:text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible"
            >
              <RotateCcw aria-hidden="true" className="h-4 w-4" /> Reset design
            </button>
            <p className="sr-only" aria-live="polite">
              {shareStatus}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
