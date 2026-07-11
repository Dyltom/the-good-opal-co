export const inquiryTypes = [
  'general',
  'custom-design',
  'virtual-viewing',
  'product-question',
  'order-support',
  'returns',
  'wholesale',
  'course-interest',
] as const

export type InquiryType = (typeof inquiryTypes)[number]

export const inquiryLabels: Record<InquiryType, string> = {
  general: 'General question',
  'custom-design': 'Custom jewellery',
  'virtual-viewing': 'Product viewing',
  'product-question': 'Product question',
  'order-support': 'Order support',
  returns: 'Return or exchange',
  wholesale: 'Wholesale or trade',
  'course-interest': 'Course or workshop interest',
}

const inquiryAliases: Record<string, InquiryType> = {
  custom: 'custom-design',
  'custom-order': 'custom-design',
  'custom-order-request': 'custom-design',
  'custom-design': 'custom-design',
  viewing: 'virtual-viewing',
  'virtual-viewing': 'virtual-viewing',
  product: 'product-question',
  'product-information': 'product-question',
  'product-question': 'product-question',
  order: 'order-support',
  'order-support': 'order-support',
  return: 'returns',
  returns: 'returns',
  wholesale: 'wholesale',
  course: 'course-interest',
  courses: 'course-interest',
  workshop: 'course-interest',
  classes: 'course-interest',
  'course-interest': 'course-interest',
  general: 'general',
}

export function resolveInquiryType(value?: string): InquiryType {
  if (!value) return 'general'
  return inquiryAliases[value.trim().toLowerCase()] ?? 'general'
}

export function cleanContactContext(value?: string): string {
  return value?.trim().slice(0, 160) ?? ''
}

export function cleanContactMessage(value?: string): string {
  return value?.trim().slice(0, 5000) ?? ''
}

export function cleanDesignConfiguration(value?: string): string {
  return value?.trim().slice(0, 1000) ?? ''
}
