import { EXTRA_COVER_INCLUDED, EXTRA_COVER_MAX } from '@/lib/constants/shipping'
import { PUBLIC_CONTACT_EMAIL } from '@/lib/constants/social'
import type { Order } from '@/types/payload-types'

export const SEND_FROM = {
  name: 'The Good Opal Co',
  businessName: 'The Good Opal Co',
  addressLine1: '',
  suburb: 'Cowra',
  state: 'NSW',
  postcode: '2794',
  phone: '',
  email: PUBLIC_CONTACT_EMAIL,
} as const

export const DEFAULT_PACKAGING_TYPE = 'AP_SATCHEL_S'
export const DEFAULT_DELIVERY_SERVICE = 'PP'
export const DEFAULT_WEIGHT_KG = '0.5'

export const MYPOST_HEADERS = [
  'Additional Label Information 1',
  'Send From Name',
  'Send From Business Name',
  'Send From Address Line 1',
  'Send From Address Line 2',
  'Send From Address Line 3',
  'Send From Suburb',
  'Send From State',
  'Send From Postcode',
  'Send From Phone Number',
  'Send From Email Address',
  'Deliver To Name',
  'Deliver To Business Name',
  'Deliver To Address Line 1',
  'Deliver To Address Line 2',
  'Deliver To Address Line 3',
  'Deliver To Suburb',
  'Deliver To State',
  'Deliver To Postcode',
  'Deliver To Phone Number',
  'Deliver To Email Address',
  'Item Packaging Type',
  'Item Delivery Service',
  'Item Description',
  'Item Length',
  'Item Width',
  'Item Height',
  'Item Weight',
  'Item Dangerous Goods Flag',
  'Schedule 8 or medicinal cannabis',
  'Signature On Delivery',
  'Extra Cover Amount',
] as const

type LabelOrder = Pick<Order, 'orderNumber' | 'status' | 'total' | 'customer' | 'shippingAddress'>

function cell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function cut(value: string | null | undefined, max: number): string {
  return (value ?? '').trim().slice(0, max)
}

function isLabelReady(order: LabelOrder): boolean {
  return (
    order.status === 'processing' && order.shippingAddress.country.trim().toUpperCase() === 'AU'
  )
}

function row(order: LabelOrder): string[] {
  const address = order.shippingAddress
  const cover =
    order.total > EXTRA_COVER_INCLUDED ? Math.min(Math.ceil(order.total), EXTRA_COVER_MAX) : 0
  return [
    cut(order.orderNumber, 50),
    cut(SEND_FROM.name, 35),
    cut(SEND_FROM.businessName, 35),
    cut(SEND_FROM.addressLine1, 40),
    '',
    '',
    cut(SEND_FROM.suburb, 30),
    SEND_FROM.state,
    SEND_FROM.postcode,
    SEND_FROM.phone,
    SEND_FROM.email,
    cut(order.customer.name, 35),
    '',
    cut(address.line1, 40),
    cut(address.line2, 40),
    '',
    cut(address.city, 40),
    cut(address.state, 3).toUpperCase(),
    cut(address.postalCode, 4),
    (order.customer.phone ?? '').replace(/[^\d]/g, '').slice(0, 20),
    cut(order.customer.email, 50),
    DEFAULT_PACKAGING_TYPE,
    DEFAULT_DELIVERY_SERVICE,
    '',
    '',
    '',
    '',
    DEFAULT_WEIGHT_KG,
    'NO',
    '',
    cover > 0 ? 'YES' : 'NO',
    cover > 0 ? String(cover) : '',
  ]
}

export function buildMyPostCsv(orders: LabelOrder[]): string {
  const lines = [[...MYPOST_HEADERS], ...orders.filter(isLabelReady).map(row)]
  return lines.map((line) => line.map(cell).join(',')).join('\r\n') + '\r\n'
}
