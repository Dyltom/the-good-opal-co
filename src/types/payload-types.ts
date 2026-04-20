// Temporary payload types file - this should be generated automatically
// Run `pnpm payload generate:types` when the payload config is working

export interface User {
  id: string
  email: string
  password?: string
  name?: string
  role?: string
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: string
  url: string
  filename: string
  mimeType: string
  filesize: number
  width?: number
  height?: number
  alt?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  title?: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
  value?: string
}

export interface Post {
  id: string
  title: string
  slug: string
  content: Record<string, unknown> // Rich text content - compatible with Lexical SerializedEditorState
  excerpt?: string
  featuredImage?: string | Media
  author?: string | User
  categories?: (string | Category)[]
  status: 'draft' | 'published'
  publishedDate?: string
  publishedAt?: string
  relatedProducts?: Array<{
    id: string
    slug: string
    name: string
    price: number
    images?: Array<{
      url?: string
      [key: string]: unknown
    }>
    [key: string]: unknown
  }>
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: unknown // RichText field
  price: number
  compareAtPrice?: number
  stock: number
  image?: string | Media
  images?: { id?: string; image?: string | Media }[]
  category?: string
  tags?: string[]
  status: 'published' | 'draft' | 'archived'
  featured?: boolean
  sku?: string
  material?: string
  stoneType?: string
  stoneOrigin?: string
  dimensions?: { id?: string; length?: number; width?: number; depth?: number }
  weight?: number
  ringSize?: string
  careInstructions?: unknown
  certified?: boolean
  certificateNumber?: string
  tenantId?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  addresses?: Address[]
  stripeCustomerId?: string
  acceptsMarketing?: boolean
  createdAt: string
  updatedAt: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface Order {
  id: string
  orderNumber: string
  customer: string | Customer
  email: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded'
  stripeSessionId?: string
  stripePaymentIntentId?: string
  shippingAddress?: Address
  billingAddress?: Address
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: string | Product
  name: string
  price: number
  quantity: number
  total: number
}