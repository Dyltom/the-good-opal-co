export function validateCurrencyAmount(value: unknown): true | string {
  if (value === null || value === undefined) return true
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return 'Enter a valid non-negative amount'
  }

  const cents = value * 100
  return Math.abs(cents - Math.round(cents)) < 1e-8 ? true : 'Use no more than two decimal places'
}

export function validateWholeStock(value: unknown): true | string {
  if (value === null || value === undefined) return true
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? true
    : 'Stock must be a whole number of zero or more'
}
