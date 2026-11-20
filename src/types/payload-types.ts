/* tslint:disable */
/* eslint-disable */

export type SupportedTimezones =
  | 'Pacific/Midway'
  | 'Pacific/Niue'
  | 'Pacific/Honolulu'
  | 'Pacific/Rarotonga'
  | 'America/Anchorage'
  | 'Pacific/Gambier'
  | 'America/Los_Angeles'
  | 'America/Tijuana'
  | 'America/Denver'
  | 'America/Phoenix'
  | 'America/Chicago'
  | 'America/Guatemala'
  | 'America/New_York'
  | 'America/Bogota'
  | 'America/Caracas'
  | 'America/Santiago'
  | 'America/Buenos_Aires'
  | 'America/Sao_Paulo'
  | 'Atlantic/South_Georgia'
  | 'Atlantic/Azores'
  | 'Atlantic/Cape_Verde'
  | 'Europe/London'
  | 'Europe/Berlin'
  | 'Africa/Lagos'
  | 'Europe/Athens'
  | 'Africa/Cairo'
  | 'Europe/Moscow'
  | 'Asia/Riyadh'
  | 'Asia/Dubai'
  | 'Asia/Baku'
  | 'Asia/Karachi'
  | 'Asia/Tashkent'
  | 'Asia/Calcutta'
  | 'Asia/Dhaka'
  | 'Asia/Almaty'
  | 'Asia/Jakarta'
  | 'Asia/Bangkok'
  | 'Asia/Shanghai'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Australia/Brisbane'
  | 'Australia/Sydney'
  | 'Pacific/Guam'
  | 'Pacific/Noumea'
  | 'Pacific/Auckland'
  | 'Pacific/Fiji'

export interface Config {
  auth: {
    users: UserAuthOperations
  }
  blocks: {}
  collections: {
    users: User
    media: Media
    authors: Author
    categories: Category
    tags: Tag
    posts: Post
    products: Product
    orders: Order
    customers: Customer
    enquiries: Enquiry
    courses: Course
    'commerce-import-runs': CommerceImportRun
    'inventory-reservations': InventoryReservation
    'custom-quotes': CustomQuote
    'custom-quote-events': CustomQuoteEvent
    'ring-assets': RingAsset
    'ring-designs': RingDesign
    'ring-reference-checks': RingReferenceCheck
    'insight-events': InsightEvent
    reviews: Review
    'payload-kv': PayloadKv
    'payload-locked-documents': PayloadLockedDocument
    'payload-preferences': PayloadPreference
    'payload-migrations': PayloadMigration
  }
  collectionsJoins: {}
  collectionsSelect: {
    users: UsersSelect<false> | UsersSelect<true>
    media: MediaSelect<false> | MediaSelect<true>
    authors: AuthorsSelect<false> | AuthorsSelect<true>
    categories: CategoriesSelect<false> | CategoriesSelect<true>
    tags: TagsSelect<false> | TagsSelect<true>
    posts: PostsSelect<false> | PostsSelect<true>
    products: ProductsSelect<false> | ProductsSelect<true>
    orders: OrdersSelect<false> | OrdersSelect<true>
    customers: CustomersSelect<false> | CustomersSelect<true>
    enquiries: EnquiriesSelect<false> | EnquiriesSelect<true>
    courses: CoursesSelect<false> | CoursesSelect<true>
    'commerce-import-runs': CommerceImportRunsSelect<false> | CommerceImportRunsSelect<true>
    'inventory-reservations': InventoryReservationsSelect<false> | InventoryReservationsSelect<true>
    'custom-quotes': CustomQuotesSelect<false> | CustomQuotesSelect<true>
    'custom-quote-events': CustomQuoteEventsSelect<false> | CustomQuoteEventsSelect<true>
    'ring-assets': RingAssetsSelect<false> | RingAssetsSelect<true>
    'ring-designs': RingDesignsSelect<false> | RingDesignsSelect<true>
    'ring-reference-checks': RingReferenceChecksSelect<false> | RingReferenceChecksSelect<true>
    'insight-events': InsightEventsSelect<false> | InsightEventsSelect<true>
    reviews: ReviewsSelect<false> | ReviewsSelect<true>
    'payload-kv': PayloadKvSelect<false> | PayloadKvSelect<true>
    'payload-locked-documents':
      | PayloadLockedDocumentsSelect<false>
      | PayloadLockedDocumentsSelect<true>
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>
  }
  db: {
    defaultIDType: number
  }
  fallbackLocale: null
  globals: {}
  globalsSelect: {}
  locale: null
  widgets: {
    collections: CollectionsWidget
  }
  user: User
  jobs: {
    tasks: unknown
    workflows: unknown
  }
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string
    password: string
  }
  login: {
    email: string
    password: string
  }
  registerFirstUser: {
    email: string
    password: string
  }
  unlock: {
    email: string
    password: string
  }
}
export interface User {
  id: number
  name: string
  role: 'admin' | 'user'
  tenantId?: string | null
  updatedAt: string
  createdAt: string
  email: string
  resetPasswordToken?: string | null
  resetPasswordExpiration?: string | null
  salt?: string | null
  hash?: string | null
  loginAttempts?: number | null
  lockUntil?: string | null
  sessions?:
    | {
        id: string
        createdAt?: string | null
        expiresAt: string
      }[]
    | null
  password?: string | null
  collection: 'users'
}
export interface Media {
  id: number
  legacyWordPressId?: number | null
  legacySourceUrl?: string | null
  alt: string
  caption?: string | null
  tenantId?: string | null
  updatedAt: string
  createdAt: string
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
  sizes?: {
    thumbnail?: {
      url?: string | null
      width?: number | null
      height?: number | null
      mimeType?: string | null
      filesize?: number | null
      filename?: string | null
    }
    card?: {
      url?: string | null
      width?: number | null
      height?: number | null
      mimeType?: string | null
      filesize?: number | null
      filename?: string | null
    }
    tablet?: {
      url?: string | null
      width?: number | null
      height?: number | null
      mimeType?: string | null
      filesize?: number | null
      filename?: string | null
    }
  }
}
export interface Author {
  id: number
  legacyWordPressId?: number | null
  name: string
  slug: string
  bio?: string | null
  avatar?: (number | null) | Media
  tenantId: string
  updatedAt: string
  createdAt: string
}
export interface Category {
  id: number
  legacyWordPressId?: number | null
  name: string
  slug: string
  description?: string | null
  tenantId: string
  updatedAt: string
  createdAt: string
}
export interface Tag {
  id: number
  legacyWordPressId?: number | null
  name: string
  slug: string
  description?: string | null
  tenantId: string
  updatedAt: string
  createdAt: string
}
export interface Post {
  id: number
  legacyWordPressId?: number | null
  title: string
  slug: string
  excerpt?: string | null
  content: {
    root: {
      type: string
      children: {
        type: any
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  }
  featuredImage?: (number | null) | Media
  publishedAt?: string | null
  author: number | Author
  categories: (number | Category)[]
  tags?: (number | Tag)[] | null
  seo?: {
    title?: string | null
    description?: string | null
    keywords?: string[] | null
    ogImage?: (number | null) | Media
  }
  tenantId: string
  meta?: {
    title?: string | null
    description?: string | null
    image?: (number | null) | Media
  }
  updatedAt: string
  createdAt: string
  _status?: ('draft' | 'published') | null
}
export interface Product {
  id: number
  name: string
  slug: string
  description: {
    root: {
      type: string
      children: {
        type: any
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  }
  price: number
  compareAtPrice?: number | null
  images?:
    | {
        image?: (number | null) | Media
        id?: string | null
      }[]
    | null
  videos?:
    | {
        video: number | Media
        poster?: (number | null) | Media
        id?: string | null
      }[]
    | null
  category:
    | 'opal-rings'
    | 'opal-necklaces'
    | 'opal-earrings'
    | 'opal-bracelets'
    | 'raw-opals'
    | 'custom-commissions'
  tags?:
    | {
        tag?: string | null
        id?: string | null
      }[]
    | null
  status: 'draft' | 'published' | 'archived'
  featured?: boolean | null
  stock?: number | null
  sku?: string | null
  legacyWooId?: number | null
  wooStatus?: string | null
  wooCatalogVisibility?: string | null
  wooManageStock?: boolean | null
  wooModifiedAt?: string | null
  material?:
    | (
        | 'sterling-silver'
        | '14k-gold'
        | '18k-gold'
        | 'white-gold'
        | 'rose-gold'
        | 'platinum'
        | 'none'
      )
    | null
  stoneType?:
    | (
        | 'black-opal'
        | 'white-opal'
        | 'boulder-opal'
        | 'crystal-opal'
        | 'fire-opal'
        | 'matrix-opal'
        | 'opal-doublet'
      )
    | null
  stoneOrigin?:
    | (
        | 'lightning-ridge'
        | 'coober-pedy'
        | 'mintabie'
        | 'andamooka'
        | 'queensland'
        | 'other-australian'
      )
    | null
  dimensions?: {
    length?: number | null
    width?: number | null
    depth?: number | null
  }
  weight?: number | null
  weightUnit?: ('carats' | 'grams') | null
  builderMappingStatus?: ('pending' | 'reviewed' | 'manual' | 'stale') | null
  builderMappingConfidence?: number | null
  builderMappingVersion?: number | null
  builderMappingMode?: ('inferred' | 'manual') | null
  builderMappingSourceImageHash?: string | null
  builderMappingInputHash?: string | null
  builderMappedImageIndex?: number | null
  builderMappingAnalyzedImageHash?: string | null
  builderPhotoAnalysisVersion?: number | null
  builderPhotoAnalysisConfidence?: number | null
  builderMappingAnalysisError?: string | null
  builderContour?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  builderContourCandidate?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  builderContourSourceImageHash?: string | null
  builderPhotoCandidateImageIndex?: number | null
  builderPhotoCandidateFocalX?: number | null
  builderPhotoCandidateFocalY?: number | null
  builderPhotoCandidateZoom?: number | null
  builderPhotoCandidateRotation?: number | null
  builderMappingReviewedAt?: string | null
  builderMappingNotes?: string | null
  builderEligible?: boolean | null
  builderSilhouette?: ('oval' | 'round' | 'elongated' | 'cushion' | 'pear' | 'heart') | null
  builderRecommendedStyle?: ('gemini' | 'coral' | 'sun-moon' | 'aurora') | null
  builderBodyColour?: string | null
  builderFlashColourPrimary?: string | null
  builderFlashColourSecondary?: string | null
  builderFlashColourAccent?: string | null
  builderTransmission?: number | null
  builderPhotoFocalX?: number | null
  builderPhotoFocalY?: number | null
  builderPhotoZoom?: number | null
  builderPhotoRotation?: number | null
  ringSize?: string | null
  careInstructions?: {
    root: {
      type: string
      children: {
        type: any
        version: number
        [k: string]: unknown
      }[]
      direction: ('ltr' | 'rtl') | null
      format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
      indent: number
      version: number
    }
    [k: string]: unknown
  } | null
  certified?: boolean | null
  certificateNumber?: string | null
  tenantId: string
  meta?: {
    title?: string | null
    description?: string | null
    image?: (number | null) | Media
  }
  updatedAt: string
  createdAt: string
}
export interface Order {
  id: number
  orderNumber: string
  source: string
  legacyWooId?: number | null
  legacyWooStatus?: string | null
  orderPlacedAt?: string | null
  paidAt?: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'disputed'
  customer: {
    email: string
    name: string
    phone?: string | null
  }
  shippingAddress: {
    line1: string
    line2?: string | null
    city: string
    state?: string | null
    postalCode?: string | null
    country: string
  }
  billingAddress?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  }
  items: {
    productId: string
    slug: string
    name: string
    price: number
    quantity: number
    image?: string | null
    id?: string | null
  }[]
  subtotal: number
  shipping?: number | null
  tax?: number | null
  total: number
  currency?: string | null
  stripeSessionId: string
  inventoryReservation?: (number | null) | InventoryReservation
  stripePaymentIntentId?: string | null
  stripeRefundedAmount?: number | null
  stripeDisputeId?: string | null
  stripeDisputeStatus?: string | null
  statusBeforeDispute?: string | null
  paymentMethod?: string | null
  legacyTransactionId?: string | null
  legacyRefunds?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  confirmationEmailSentAt?: string | null
  confirmationEmailError?: string | null
  inventoryRestockedAt?: string | null
  inventoryDecrementedAt?: string | null
  inventoryAlertSentAt?: string | null
  inventoryAlertError?: string | null
  shipmentEmailSentAt?: string | null
  shipmentEmailError?: string | null
  trackingNumber?: string | null
  shippingCarrier?: ('australia-post' | 'startrack' | 'dhl' | 'fedex' | 'other') | null
  notes?: string | null
  updatedAt: string
  createdAt: string
}
export interface InventoryReservation {
  id: number
  token: string
  stripeSessionId: string
  status: 'active' | 'pending-payment' | 'consumed' | 'released'
  expiresAt: string
  releasedAt?: string | null
  releaseReason?: string | null
  consumedAt?: string | null
  items: {
    productId: string
    slug: string
    name: string
    unitAmountCents: number
    quantity: number
    id?: string | null
  }[]
  updatedAt: string
  createdAt: string
}
export interface Customer {
  id: number
  email: string
  legacyWooId?: number | null
  wooCreatedAt?: string | null
  name?: string | null
  phone?: string | null
  subscribedToNewsletter?: boolean | null
  emailVerified?: boolean | null
  subscribedAt?: string | null
  confirmationTokenHash?: string | null
  confirmationExpiresAt?: string | null
  unsubscribeTokenHash?: string | null
  newsletterWelcomeSentAt?: string | null
  newsletterEmailError?: string | null
  source?: ('checkout' | 'newsletter' | 'contact' | 'manual' | 'import') | null
  notes?: string | null
  totalOrders?: number | null
  totalSpent?: number | null
  lastOrderDate?: string | null
  defaultAddress?: {
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    country?: string | null
  }
  tags?:
    | {
        tag: string
        id?: string | null
      }[]
    | null
  updatedAt: string
  createdAt: string
}
export interface Enquiry {
  id: number
  reference: string
  type:
    | 'general'
    | 'custom-design'
    | 'virtual-viewing'
    | 'product-question'
    | 'order-support'
    | 'returns'
    | 'wholesale'
    | 'course-interest'
  status:
    | 'new'
    | 'reviewing'
    | 'awaiting-customer'
    | 'consultation'
    | 'quoted'
    | 'accepted'
    | 'deposit-paid'
    | 'in-production'
    | 'completed'
    | 'declined'
    | 'spam'
  name: string
  email: string
  phone?: string | null
  orderNumber?: string | null
  product?: string | null
  budget?: string | null
  timeline?: string | null
  message: string
  designConfiguration?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  source: 'website-contact' | 'custom-builder' | 'manual'
  submittedAt: string
  ownerEmailSentAt?: string | null
  customerEmailSentAt?: string | null
  emailDeliveryError?: string | null
  internalNotes?: string | null
  updatedAt: string
  createdAt: string
}
export interface Course {
  id: number
  legacyWordPressId?: number | null
  title: string
  slug: string
  summary: string
  introduction: string
  featuredImage?: (number | null) | Media
  status: 'draft' | 'published' | 'archived'
  publishedAt?: string | null
  format: 'online' | 'live-online' | 'in-person'
  level: 'beginner' | 'all-levels' | 'intermediate'
  duration?: string | null
  availability: 'register-interest' | 'coming-soon' | 'closed'
  instructor: {
    name: string
    role?: string | null
    bio?: string | null
  }
  curriculum: {
    title: string
    summary: string
    topics?: string | null
    id?: string | null
  }[]
  audience?:
    | {
        item: string
        id?: string | null
      }[]
    | null
  outcomes?:
    | {
        item: string
        id?: string | null
      }[]
    | null
  tenantId: string
  meta?: {
    title?: string | null
    description?: string | null
    image?: (number | null) | Media
  }
  updatedAt: string
  createdAt: string
}
export interface CommerceImportRun {
  id: number
  runId: string
  mode: 'initial' | 'final-delta'
  status: 'running' | 'completed' | 'failed'
  deploymentId?: string | null
  startedAt: string
  completedAt?: string | null
  failedAt?: string | null
  summary?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  error?: string | null
  updatedAt: string
  createdAt: string
}
export interface CustomQuote {
  id: number
  quoteNumber: string
  quoteSeriesId: string
  revision: number
  supersedes?: (number | null) | CustomQuote
  enquiry: number | Enquiry
  customerEmail: string
  status: 'draft' | 'sent' | 'accepted' | 'expired' | 'cancelled' | 'superseded'
  amountCents: number
  depositAmountCents: number
  currency: 'AUD'
  validUntil: string
  terms: string
  acceptedAt?: string | null
  acceptedByEmail?: string | null
  acceptedTermsHash?: string | null
  acceptedStatementVersion?: string | null
  acceptedEvidenceHash?: string | null
  depositStatus: 'not-required' | 'awaiting-payment' | 'paid' | 'refunded'
  amountPaidCents?: number | null
  paidAt?: string | null
  stripeRefundedAmountCents?: number | null
  refundedAt?: string | null
  depositCheckoutGeneration?: number | null
  pendingStripeCheckoutSessionId?: string | null
  pendingStripeCheckoutExpiresAt?: string | null
  stripeCheckoutSessionId?: string | null
  stripePaymentIntentId?: string | null
  stripeDisputeId?: string | null
  stripeDisputeStatus?: string | null
  depositDisputedAt?: string | null
  stripeDisputeEventAt?: string | null
  internalNotes?: string | null
  linkVersion: number
  customerEmailSentAt?: string | null
  customerEmailProviderId?: string | null
  customerEmailError?: string | null
  deliveryStatus: 'not-sent' | 'issuing' | 'sent' | 'failed'
  deliveryAttemptCount?: number | null
  deliveryLastAttemptAt?: string | null
  depositConfirmationEmailSentAt?: string | null
  depositConfirmationEmailProviderId?: string | null
  depositConfirmationEmailError?: string | null
  updatedAt: string
  createdAt: string
}
export interface CustomQuoteEvent {
  id: number
  quote: number | CustomQuote
  enquiry: number | Enquiry
  eventType:
    | 'created'
    | 'sent'
    | 'accepted'
    | 'expired'
    | 'cancelled'
    | 'superseded'
    | 'deposit-paid'
    | 'deposit-refunded'
    | 'deposit-disputed'
    | 'deposit-dispute-resolved'
  occurredAt: string
  quoteRevision: number
  actorType: 'admin' | 'customer' | 'stripe' | 'system'
  actorEmail?: string | null
  amountCents: number
  depositAmountCents: number
  currency: string
  validUntil: string
  termsSnapshot: string
  termsHash: string
  evidence?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  updatedAt: string
  createdAt: string
}
export interface RingAsset {
  id: number
  name: string
  notes?: string | null
  sha256: string
  byteLength: number
  validationVersion: string
  validated: boolean
  nodeNames:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  materialNames:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  bounds:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  updatedAt: string
  createdAt: string
  url?: string | null
  thumbnailURL?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
  width?: number | null
  height?: number | null
  focalX?: number | null
  focalY?: number | null
}
export interface RingDesign {
  id: number
  name: string
  slug: string
  style: 'gemini' | 'coral' | 'sun-moon' | 'aurora'
  status: 'draft' | 'published' | 'archived'
  sourceReferences:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  measurements?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  modelDefinition?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  makerApproved?: boolean | null
  approvedAt?: string | null
  approvalNotes?: string | null
  updatedAt: string
  createdAt: string
}
export interface RingReferenceCheck {
  id: number
  checkKey: string
  ringDesign?: (number | null) | RingDesign
  candidateKey?: string | null
  sourceUrl: string
  accountHandle: string
  shortcode: string
  checkedAt: string
  outcome: 'available' | 'redirected' | 'not-found' | 'rate-limited' | 'blocked' | 'error'
  httpStatus?: number | null
  resolvedUrl?: string | null
  durationMs?: number | null
  updatedAt: string
  createdAt: string
}
export interface InsightEvent {
  id: number
  name: string
  occurredAt: string
  path: string
  productId?: string | null
  value?: number | null
  visitor?: string | null
  landingPage?: string | null
  referrerHost?: string | null
  utmSource?: string | null
  utmMedium?: string | null
  utmCampaign?: string | null
  country?: string | null
  device?: string | null
  browser?: string | null
  detail?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  dedupeKey?: string | null
}
export interface Review {
  id: number
  authorName: string
  body: string
  rating?: number | null
  reviewedAt: string
  source: string
  sourceUrl?: string | null
  product?: (number | null) | Product
  status: 'draft' | 'published'
  updatedAt: string
  createdAt: string
}
export interface PayloadKv {
  id: number
  key: string
  data:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
}
export interface PayloadLockedDocument {
  id: number
  document?:
    | ({
        relationTo: 'users'
        value: number | User
      } | null)
    | ({
        relationTo: 'media'
        value: number | Media
      } | null)
    | ({
        relationTo: 'authors'
        value: number | Author
      } | null)
    | ({
        relationTo: 'categories'
        value: number | Category
      } | null)
    | ({
        relationTo: 'tags'
        value: number | Tag
      } | null)
    | ({
        relationTo: 'posts'
        value: number | Post
      } | null)
    | ({
        relationTo: 'products'
        value: number | Product
      } | null)
    | ({
        relationTo: 'orders'
        value: number | Order
      } | null)
    | ({
        relationTo: 'customers'
        value: number | Customer
      } | null)
    | ({
        relationTo: 'enquiries'
        value: number | Enquiry
      } | null)
    | ({
        relationTo: 'courses'
        value: number | Course
      } | null)
    | ({
        relationTo: 'commerce-import-runs'
        value: number | CommerceImportRun
      } | null)
    | ({
        relationTo: 'inventory-reservations'
        value: number | InventoryReservation
      } | null)
    | ({
        relationTo: 'custom-quotes'
        value: number | CustomQuote
      } | null)
    | ({
        relationTo: 'custom-quote-events'
        value: number | CustomQuoteEvent
      } | null)
    | ({
        relationTo: 'ring-assets'
        value: number | RingAsset
      } | null)
    | ({
        relationTo: 'ring-designs'
        value: number | RingDesign
      } | null)
    | ({
        relationTo: 'ring-reference-checks'
        value: number | RingReferenceCheck
      } | null)
    | ({
        relationTo: 'reviews'
        value: number | Review
      } | null)
  globalSlug?: string | null
  user: {
    relationTo: 'users'
    value: number | User
  }
  updatedAt: string
  createdAt: string
}
export interface PayloadPreference {
  id: number
  user: {
    relationTo: 'users'
    value: number | User
  }
  key?: string | null
  value?:
    | {
        [k: string]: unknown
      }
    | unknown[]
    | string
    | number
    | boolean
    | null
  updatedAt: string
  createdAt: string
}
export interface PayloadMigration {
  id: number
  name?: string | null
  batch?: number | null
  updatedAt: string
  createdAt: string
}
export interface UsersSelect<T extends boolean = true> {
  name?: T
  role?: T
  tenantId?: T
  updatedAt?: T
  createdAt?: T
  email?: T
  resetPasswordToken?: T
  resetPasswordExpiration?: T
  salt?: T
  hash?: T
  loginAttempts?: T
  lockUntil?: T
  sessions?:
    | T
    | {
        id?: T
        createdAt?: T
        expiresAt?: T
      }
}
export interface MediaSelect<T extends boolean = true> {
  legacyWordPressId?: T
  legacySourceUrl?: T
  alt?: T
  caption?: T
  tenantId?: T
  updatedAt?: T
  createdAt?: T
  url?: T
  thumbnailURL?: T
  filename?: T
  mimeType?: T
  filesize?: T
  width?: T
  height?: T
  focalX?: T
  focalY?: T
  sizes?:
    | T
    | {
        thumbnail?:
          | T
          | {
              url?: T
              width?: T
              height?: T
              mimeType?: T
              filesize?: T
              filename?: T
            }
        card?:
          | T
          | {
              url?: T
              width?: T
              height?: T
              mimeType?: T
              filesize?: T
              filename?: T
            }
        tablet?:
          | T
          | {
              url?: T
              width?: T
              height?: T
              mimeType?: T
              filesize?: T
              filename?: T
            }
      }
}
export interface AuthorsSelect<T extends boolean = true> {
  legacyWordPressId?: T
  name?: T
  slug?: T
  bio?: T
  avatar?: T
  tenantId?: T
  updatedAt?: T
  createdAt?: T
}
export interface CategoriesSelect<T extends boolean = true> {
  legacyWordPressId?: T
  name?: T
  slug?: T
  description?: T
  tenantId?: T
  updatedAt?: T
  createdAt?: T
}
export interface TagsSelect<T extends boolean = true> {
  legacyWordPressId?: T
  name?: T
  slug?: T
  description?: T
  tenantId?: T
  updatedAt?: T
  createdAt?: T
}
export interface PostsSelect<T extends boolean = true> {
  legacyWordPressId?: T
  title?: T
  slug?: T
  excerpt?: T
  content?: T
  featuredImage?: T
  publishedAt?: T
  author?: T
  categories?: T
  tags?: T
  seo?:
    | T
    | {
        title?: T
        description?: T
        keywords?: T
        ogImage?: T
      }
  tenantId?: T
  meta?:
    | T
    | {
        title?: T
        description?: T
        image?: T
      }
  updatedAt?: T
  createdAt?: T
  _status?: T
}
export interface ProductsSelect<T extends boolean = true> {
  name?: T
  slug?: T
  description?: T
  price?: T
  compareAtPrice?: T
  images?:
    | T
    | {
        image?: T
        id?: T
      }
  videos?:
    | T
    | {
        video?: T
        poster?: T
        id?: T
      }
  category?: T
  tags?:
    | T
    | {
        tag?: T
        id?: T
      }
  status?: T
  featured?: T
  stock?: T
  sku?: T
  legacyWooId?: T
  wooStatus?: T
  wooCatalogVisibility?: T
  wooManageStock?: T
  wooModifiedAt?: T
  material?: T
  stoneType?: T
  stoneOrigin?: T
  dimensions?:
    | T
    | {
        length?: T
        width?: T
        depth?: T
      }
  weight?: T
  weightUnit?: T
  builderMappingStatus?: T
  builderMappingConfidence?: T
  builderMappingVersion?: T
  builderMappingMode?: T
  builderMappingSourceImageHash?: T
  builderMappingInputHash?: T
  builderMappedImageIndex?: T
  builderMappingAnalyzedImageHash?: T
  builderPhotoAnalysisVersion?: T
  builderPhotoAnalysisConfidence?: T
  builderMappingAnalysisError?: T
  builderContour?: T
  builderContourCandidate?: T
  builderContourSourceImageHash?: T
  builderPhotoCandidateImageIndex?: T
  builderPhotoCandidateFocalX?: T
  builderPhotoCandidateFocalY?: T
  builderPhotoCandidateZoom?: T
  builderPhotoCandidateRotation?: T
  builderMappingReviewedAt?: T
  builderMappingNotes?: T
  builderEligible?: T
  builderSilhouette?: T
  builderRecommendedStyle?: T
  builderBodyColour?: T
  builderFlashColourPrimary?: T
  builderFlashColourSecondary?: T
  builderFlashColourAccent?: T
  builderTransmission?: T
  builderPhotoFocalX?: T
  builderPhotoFocalY?: T
  builderPhotoZoom?: T
  builderPhotoRotation?: T
  ringSize?: T
  careInstructions?: T
  certified?: T
  certificateNumber?: T
  tenantId?: T
  meta?:
    | T
    | {
        title?: T
        description?: T
        image?: T
      }
  updatedAt?: T
  createdAt?: T
}
export interface OrdersSelect<T extends boolean = true> {
  orderNumber?: T
  source?: T
  legacyWooId?: T
  legacyWooStatus?: T
  orderPlacedAt?: T
  paidAt?: T
  status?: T
  customer?:
    | T
    | {
        email?: T
        name?: T
        phone?: T
      }
  shippingAddress?:
    | T
    | {
        line1?: T
        line2?: T
        city?: T
        state?: T
        postalCode?: T
        country?: T
      }
  billingAddress?:
    | T
    | {
        line1?: T
        line2?: T
        city?: T
        state?: T
        postalCode?: T
        country?: T
      }
  items?:
    | T
    | {
        productId?: T
        slug?: T
        name?: T
        price?: T
        quantity?: T
        image?: T
        id?: T
      }
  subtotal?: T
  shipping?: T
  tax?: T
  total?: T
  currency?: T
  stripeSessionId?: T
  inventoryReservation?: T
  stripePaymentIntentId?: T
  stripeRefundedAmount?: T
  stripeDisputeId?: T
  stripeDisputeStatus?: T
  statusBeforeDispute?: T
  paymentMethod?: T
  legacyTransactionId?: T
  legacyRefunds?: T
  confirmationEmailSentAt?: T
  confirmationEmailError?: T
  inventoryRestockedAt?: T
  inventoryDecrementedAt?: T
  inventoryAlertSentAt?: T
  inventoryAlertError?: T
  shipmentEmailSentAt?: T
  shipmentEmailError?: T
  trackingNumber?: T
  shippingCarrier?: T
  notes?: T
  updatedAt?: T
  createdAt?: T
}
export interface CustomersSelect<T extends boolean = true> {
  email?: T
  legacyWooId?: T
  wooCreatedAt?: T
  name?: T
  phone?: T
  subscribedToNewsletter?: T
  emailVerified?: T
  subscribedAt?: T
  confirmationTokenHash?: T
  confirmationExpiresAt?: T
  unsubscribeTokenHash?: T
  newsletterWelcomeSentAt?: T
  newsletterEmailError?: T
  source?: T
  notes?: T
  totalOrders?: T
  totalSpent?: T
  lastOrderDate?: T
  defaultAddress?:
    | T
    | {
        line1?: T
        line2?: T
        city?: T
        state?: T
        postalCode?: T
        country?: T
      }
  tags?:
    | T
    | {
        tag?: T
        id?: T
      }
  updatedAt?: T
  createdAt?: T
}
export interface EnquiriesSelect<T extends boolean = true> {
  reference?: T
  type?: T
  status?: T
  name?: T
  email?: T
  phone?: T
  orderNumber?: T
  product?: T
  budget?: T
  timeline?: T
  message?: T
  designConfiguration?: T
  source?: T
  submittedAt?: T
  ownerEmailSentAt?: T
  customerEmailSentAt?: T
  emailDeliveryError?: T
  internalNotes?: T
  updatedAt?: T
  createdAt?: T
}
export interface CoursesSelect<T extends boolean = true> {
  legacyWordPressId?: T
  title?: T
  slug?: T
  summary?: T
  introduction?: T
  featuredImage?: T
  status?: T
  publishedAt?: T
  format?: T
  level?: T
  duration?: T
  availability?: T
  instructor?:
    | T
    | {
        name?: T
        role?: T
        bio?: T
      }
  curriculum?:
    | T
    | {
        title?: T
        summary?: T
        topics?: T
        id?: T
      }
  audience?:
    | T
    | {
        item?: T
        id?: T
      }
  outcomes?:
    | T
    | {
        item?: T
        id?: T
      }
  tenantId?: T
  meta?:
    | T
    | {
        title?: T
        description?: T
        image?: T
      }
  updatedAt?: T
  createdAt?: T
}
export interface CommerceImportRunsSelect<T extends boolean = true> {
  runId?: T
  mode?: T
  status?: T
  deploymentId?: T
  startedAt?: T
  completedAt?: T
  failedAt?: T
  summary?: T
  error?: T
  updatedAt?: T
  createdAt?: T
}
export interface InventoryReservationsSelect<T extends boolean = true> {
  token?: T
  stripeSessionId?: T
  status?: T
  expiresAt?: T
  releasedAt?: T
  releaseReason?: T
  consumedAt?: T
  items?:
    | T
    | {
        productId?: T
        slug?: T
        name?: T
        unitAmountCents?: T
        quantity?: T
        id?: T
      }
  updatedAt?: T
  createdAt?: T
}
export interface CustomQuotesSelect<T extends boolean = true> {
  quoteNumber?: T
  quoteSeriesId?: T
  revision?: T
  supersedes?: T
  enquiry?: T
  customerEmail?: T
  status?: T
  amountCents?: T
  depositAmountCents?: T
  currency?: T
  validUntil?: T
  terms?: T
  acceptedAt?: T
  acceptedByEmail?: T
  acceptedTermsHash?: T
  acceptedStatementVersion?: T
  acceptedEvidenceHash?: T
  depositStatus?: T
  amountPaidCents?: T
  paidAt?: T
  stripeRefundedAmountCents?: T
  refundedAt?: T
  depositCheckoutGeneration?: T
  pendingStripeCheckoutSessionId?: T
  pendingStripeCheckoutExpiresAt?: T
  stripeCheckoutSessionId?: T
  stripePaymentIntentId?: T
  stripeDisputeId?: T
  stripeDisputeStatus?: T
  depositDisputedAt?: T
  stripeDisputeEventAt?: T
  internalNotes?: T
  linkVersion?: T
  customerEmailSentAt?: T
  customerEmailProviderId?: T
  customerEmailError?: T
  deliveryStatus?: T
  deliveryAttemptCount?: T
  deliveryLastAttemptAt?: T
  depositConfirmationEmailSentAt?: T
  depositConfirmationEmailProviderId?: T
  depositConfirmationEmailError?: T
  updatedAt?: T
  createdAt?: T
}
export interface CustomQuoteEventsSelect<T extends boolean = true> {
  quote?: T
  enquiry?: T
  eventType?: T
  occurredAt?: T
  quoteRevision?: T
  actorType?: T
  actorEmail?: T
  amountCents?: T
  depositAmountCents?: T
  currency?: T
  validUntil?: T
  termsSnapshot?: T
  termsHash?: T
  evidence?: T
  updatedAt?: T
  createdAt?: T
}
export interface RingAssetsSelect<T extends boolean = true> {
  name?: T
  notes?: T
  sha256?: T
  byteLength?: T
  validationVersion?: T
  validated?: T
  nodeNames?: T
  materialNames?: T
  bounds?: T
  updatedAt?: T
  createdAt?: T
  url?: T
  thumbnailURL?: T
  filename?: T
  mimeType?: T
  filesize?: T
  width?: T
  height?: T
  focalX?: T
  focalY?: T
}
export interface RingDesignsSelect<T extends boolean = true> {
  name?: T
  slug?: T
  style?: T
  status?: T
  sourceReferences?: T
  measurements?: T
  modelDefinition?: T
  makerApproved?: T
  approvedAt?: T
  approvalNotes?: T
  updatedAt?: T
  createdAt?: T
}
export interface RingReferenceChecksSelect<T extends boolean = true> {
  checkKey?: T
  ringDesign?: T
  candidateKey?: T
  sourceUrl?: T
  accountHandle?: T
  shortcode?: T
  checkedAt?: T
  outcome?: T
  httpStatus?: T
  resolvedUrl?: T
  durationMs?: T
  updatedAt?: T
  createdAt?: T
}
export interface InsightEventsSelect<T extends boolean = true> {
  name?: T
  occurredAt?: T
  path?: T
  productId?: T
  value?: T
  visitor?: T
  landingPage?: T
  referrerHost?: T
  utmSource?: T
  utmMedium?: T
  utmCampaign?: T
  country?: T
  device?: T
  browser?: T
  detail?: T
  dedupeKey?: T
}
export interface ReviewsSelect<T extends boolean = true> {
  authorName?: T
  body?: T
  rating?: T
  reviewedAt?: T
  source?: T
  sourceUrl?: T
  product?: T
  status?: T
  updatedAt?: T
  createdAt?: T
}
export interface PayloadKvSelect<T extends boolean = true> {
  key?: T
  data?: T
}
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T
  globalSlug?: T
  user?: T
  updatedAt?: T
  createdAt?: T
}
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T
  key?: T
  value?: T
  updatedAt?: T
  createdAt?: T
}
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T
  batch?: T
  updatedAt?: T
  createdAt?: T
}
export interface CollectionsWidget {
  data?: {
    [k: string]: unknown
  }
  width: 'full'
}
export interface Auth {
  [k: string]: unknown
}

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}
