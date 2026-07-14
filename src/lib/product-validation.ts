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

const builderShapes = new Set(['oval', 'round', 'elongated', 'cushion', 'pear', 'heart'])
const builderStyles = new Set(['gemini', 'coral', 'sun-moon', 'aurora'])
const hexColourPattern = /^#[0-9a-f]{6}$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function validateHexColour(value: unknown): true | string {
  if (value === null || value === undefined || value === '') return true
  return typeof value === 'string' && hexColourPattern.test(value)
    ? true
    : 'Use a six-digit hex colour such as #78c5df'
}

export function validateBuilderProduct(data: unknown, originalData?: unknown): true | string {
  if (isRecord(data) && isRecord(originalData)) {
    data = {
      ...originalData,
      ...data,
      dimensions:
        isRecord(originalData.dimensions) || isRecord(data.dimensions)
          ? {
              ...(isRecord(originalData.dimensions) ? originalData.dimensions : {}),
              ...(isRecord(data.dimensions) ? data.dimensions : {}),
            }
          : (data.dimensions ?? originalData.dimensions),
    }
  }
  if (!isRecord(data) || data.builderEligible !== true) return true

  if (data.category !== 'raw-opals') {
    return 'Builder opals must use the Raw Opals category'
  }
  if (!data.stoneType) return 'Builder opals require an opal type'
  if (
    data.builderMappingStatus !== undefined &&
    data.builderMappingStatus !== null &&
    data.builderMappingStatus !== 'reviewed' &&
    data.builderMappingStatus !== 'manual'
  ) {
    return 'Builder opals require a reviewed or manually approved mapping'
  }
  if (!builderShapes.has(String(data.builderSilhouette))) {
    return 'Builder opals require a reviewed silhouette'
  }
  if (!builderStyles.has(String(data.builderRecommendedStyle))) {
    return 'Builder opals require a compatible ring style'
  }

  for (const field of [
    'builderBodyColour',
    'builderFlashColourPrimary',
    'builderFlashColourSecondary',
    'builderFlashColourAccent',
  ]) {
    if (validateHexColour(data[field]) !== true) {
      return 'Builder body and flash colours must use six-digit hex values'
    }
  }

  if (
    typeof data.builderTransmission !== 'number' ||
    data.builderTransmission < 0 ||
    data.builderTransmission > 1
  ) {
    return 'Builder transmission must be between 0 and 1'
  }
  if (
    typeof data.builderPhotoFocalX !== 'number' ||
    data.builderPhotoFocalX < 0 ||
    data.builderPhotoFocalX > 1 ||
    typeof data.builderPhotoFocalY !== 'number' ||
    data.builderPhotoFocalY < 0 ||
    data.builderPhotoFocalY > 1 ||
    typeof data.builderPhotoZoom !== 'number' ||
    data.builderPhotoZoom < 1 ||
    (data.builderPhotoRotation !== undefined &&
      data.builderPhotoRotation !== null &&
      (typeof data.builderPhotoRotation !== 'number' ||
        !Number.isFinite(data.builderPhotoRotation) ||
        data.builderPhotoRotation < -180 ||
        data.builderPhotoRotation > 180))
  ) {
    return 'Builder opals require a reviewed photo crop'
  }

  const dimensions = data.dimensions
  if (
    dimensions !== undefined &&
    dimensions !== null &&
    (!isRecord(dimensions) ||
      !isPositiveNumber(dimensions.width) ||
      !isPositiveNumber(dimensions.length) ||
      !isPositiveNumber(dimensions.depth))
  ) {
    return 'Builder opals require positive width, length, and depth measurements'
  }

  const images = data.images
  if (!Array.isArray(images) || images.length === 0) {
    return 'Builder opals require a reviewed face image'
  }
  const imageIndex = data.builderMappedImageIndex ?? 0
  if (
    typeof imageIndex !== 'number' ||
    !Number.isInteger(imageIndex) ||
    imageIndex < 0 ||
    imageIndex >= images.length
  ) {
    return 'Builder mapped image must reference an existing gallery image'
  }

  return true
}
