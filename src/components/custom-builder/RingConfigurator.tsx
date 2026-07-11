'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, ExternalLink, RotateCcw, Share2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import {
  applyRingStyle,
  describeRingConfig,
  metals,
  ringStyles,
  shapeForOpal,
  ringConfigToSearchParams,
} from './config'
import type { BuilderOpal, ConfigOption, RingConfig, RingStyleOption } from './config'
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
        These are live, one-of-a-kind stones from the store. The photograph is authoritative; the 3D
        stone approximates placement and body tone.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {opals.map((opal) => {
          const selected = opal.id === selectedId
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
              <span className="relative block aspect-square overflow-hidden bg-warm-grey/25">
                <Image
                  src={opal.imageUrl}
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
                <span className="line-clamp-2 block text-sm font-medium leading-5">
                  {opal.name}
                </span>
                <span className="mt-1 block text-xs text-charcoal-light">
                  {opal.stoneTypeLabel} · {formatCurrency(opal.price)} loose
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

function RingStylePicker({
  value,
  onSelect,
}: {
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
          return (
            <button
              key={style.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(style)}
              className={cn(
                'group overflow-hidden rounded-lg border bg-white text-left transition-[border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 active:scale-[0.99]',
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
                  {style.detail}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function RingConfigurator({ initialConfig, opals }: RingConfiguratorProps) {
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
      const next = { ...current, opalId: opal.id, stone: opal.renderStone }
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
        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:self-start">
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
                value={config.style}
                onSelect={(style) =>
                  setConfig((current) => ({
                    ...applyRingStyle(current, style.id),
                    ...(selectedOpal ? { shape: shapeForOpal(selectedOpal) } : {}),
                  }))
                }
              />

              <fieldset>
                <legend className="font-serif text-xl font-medium">4. Ring size (US)</legend>
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
