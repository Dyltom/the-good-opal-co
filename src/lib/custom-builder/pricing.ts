import type { RingConfig } from '@/components/custom-builder/config'
import { ringStyles } from '@/components/custom-builder/config'

export interface MetalSpot {
  goldAudPerOz: number
  silverAudPerOz: number
  asOf: string
  live: boolean
}

export const priceSheetSpot: MetalSpot = {
  goldAudPerOz: 5330,
  silverAudPerOz: 61.87,
  asOf: '2026-11-22T00:00:00.000Z',
  live: false,
}

type PricedSetting = 'bezel' | 'claw-4' | 'claw-6'

const priceSheet: Record<
  RingConfig['band'],
  Record<PricedSetting, { silver: number; gold9ct: number }>
> = {
  thin: {
    'claw-4': { silver: 446, gold9ct: 991 },
    'claw-6': { silver: 448, gold9ct: 1041 },
    bezel: { silver: 450, gold9ct: 1091 },
  },
  chunky: {
    'claw-4': { silver: 564, gold9ct: 1676 },
    'claw-6': { silver: 566, gold9ct: 1726 },
    bezel: { silver: 568, gold9ct: 1776 },
  },
}

interface Alloy {
  element: 'gold' | 'silver'
  fineness: number
  density: number
}

const sterlingSilver: Alloy = { element: 'silver', fineness: 0.925, density: 10.36 }
const nineCaratGold: Alloy = { element: 'gold', fineness: 0.375, density: 11.2 }

const alloys: Record<RingConfig['metal'], Alloy | null> = {
  'sterling-silver': sterlingSilver,
  '9ct-gold': nineCaratGold,
  'white-gold': nineCaratGold,
  'rose-gold': nineCaratGold,
  '14k-gold': { element: 'gold', fineness: 0.585, density: 13.1 },
  '18k-gold': { element: 'gold', fineness: 0.75, density: 15.5 },
  platinum: null,
}

const gramsPerTroyOunce = 31.1035

function metalCostPerCm3(alloy: Alloy, spot: MetalSpot): number {
  const audPerOz = alloy.element === 'gold' ? spot.goldAudPerOz : spot.silverAudPerOz
  return alloy.density * alloy.fineness * (audPerOz / gramsPerTroyOunce)
}

function pricedSetting(setting: RingConfig['setting']): PricedSetting {
  return setting === 'beaded' || setting === 'claw-8' ? 'bezel' : setting
}

export function estimateRingPrice(
  config: Pick<RingConfig, 'metal' | 'style'>,
  spot: MetalSpot
): number | null {
  const alloy = alloys[config.metal]
  if (!alloy) return null
  const style = ringStyles.find((option) => option.id === config.style) ?? ringStyles[0]!
  const row = priceSheet[style.band][pricedSetting(style.setting)]
  const silverCost = metalCostPerCm3(sterlingSilver, priceSheetSpot)
  const goldCost = metalCostPerCm3(nineCaratGold, priceSheetSpot)
  const metalShare = (row.gold9ct - row.silver) / (goldCost - silverCost)
  const making = row.silver - metalShare * silverCost
  return Math.round(making + metalShare * metalCostPerCm3(alloy, spot))
}

const wholeDollars = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
})

export function formatWholeDollars(amount: number): string {
  return wholeDollars.format(amount)
}
