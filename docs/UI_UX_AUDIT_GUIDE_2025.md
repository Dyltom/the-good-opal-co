# UI/UX Audit & Modernization Guide for Claude Code Agents

> **Purpose**: This guide helps Claude Code agents identify and fix UI/UX issues in The Good Opal Co codebase while applying modern 2025 best practices and SOLID principles.

## Table of Contents
1. [Critical Issues to Address](#critical-issues-to-address)
2. [Modern 2025 UI/UX Standards](#modern-2025-uiux-standards)
3. [SOLID Principles for React Components](#solid-principles-for-react-components)
4. [Specific Fixes Required](#specific-fixes-required)
5. [Implementation Guidelines](#implementation-guidelines)
6. [Quality Checklist](#quality-checklist)

## Critical Issues to Address

### 🔴 High Priority Issues

#### 1. **Inconsistent Image Implementation**
- **Problem**: Mixed usage of native `<img>` tags with eslint-disable comments
- **Files Affected**:
  - `src/app/(marketing)/page.tsx:64-287` (multiple instances)
  - `src/components/product/ProductCard.tsx:81`
  - `src/components/sections/HeroCarousel.tsx:111`
  - `src/app/(marketing)/cart/page.tsx:92`
- **Fix**: Standardize on Next.js `Image` component with proper optimization

```tsx
// ❌ BAD: Native img with eslint-disable
{/* eslint-disable-next-line @next/next/no-img-element */}
<img src="/images/hero.jpg" alt="Hero" />

// ✅ GOOD: Next.js Image with optimization
import Image from 'next/image'
<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority
  quality={85}
/>
```

#### 2. **Hardcoded Design Values**
- **Problem**: Magic numbers and hardcoded colors throughout codebase
- **Files with Issues**:
  - Hardcoded spacing: `pt-28`, `pb-20`, `mb-14` (18 files affected)
  - Hardcoded colors: `text-white/70`, `bg-black-rich/80`
- **Fix**: Create design token system

```tsx
// ❌ BAD: Hardcoded values
<section className="pt-28 pb-20 mb-14 bg-black-rich/80 text-white/70">

// ✅ GOOD: Design tokens
<section className="pt-section-top pb-section-bottom mb-section-gap bg-surface-overlay text-content-secondary">
```

#### 3. **Missing Error Boundaries**
- **Problem**: No component-level error handling
- **Fix**: Implement error boundaries for critical components

```tsx
// Create reusable ErrorBoundary component
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error }>
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}
```

### 🟡 Medium Priority Issues

#### 4. **Accessibility Gaps**
- **Missing**: Skip links, color contrast verification
- **Fix**: Add skip navigation and audit contrast ratios

```tsx
// Add to layout.tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to main content
</a>
```

#### 5. **Form Validation**
- **Problem**: No schema-based validation
- **Fix**: Implement Zod schemas for all forms

```tsx
// Example: Contact form schema
const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})
```

## Modern 2025 UI/UX Standards

Based on research from [2025 UI/UX trends](https://www.fullstack.com/labs/resources/blog/top-5-ux-ui-design-trends-in-2025-the-future-of-user-experiences) and [design system best practices](https://medium.com/@oneentrycloud/design-systems-and-reusable-components-in-2025-a-practical-guide-c3f9ac904a57), implement these patterns:

### 1. **AI-Driven Personalization**
```tsx
// Add user preference tracking
interface UserPreferences {
  colorScheme: 'light' | 'dark' | 'auto'
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large'
}

// Implement adaptive UI based on preferences
export function useAdaptiveUI() {
  const preferences = useUserPreferences()
  return {
    motion: preferences.reducedMotion ? 'reduced' : 'normal',
    scale: preferences.fontSize,
    theme: preferences.colorScheme
  }
}
```

### 2. **Performance-First Design**
Per [web performance best practices](https://cygnis.co/blog/web-app-ui-ux-best-practices-2025/):
- Implement code splitting for route-based chunks
- Use dynamic imports for heavy components
- Add resource hints for critical assets

```tsx
// Lazy load heavy components
const ProductGallery = dynamic(() => import('@/components/product/ProductGallery'), {
  loading: () => <ProductGallerySkeleton />,
  ssr: false
})
```

### 3. **Token-First Architecture**
Following [design system architecture trends](https://ui-deploy.com/blog/complete-design-system-documentation-guide-how-to-create-scalable-component-libraries-2025):

```tsx
// Create design tokens in tailwind.config.ts
export const tokens = {
  spacing: {
    'section-top': 'var(--spacing-section-top, 7rem)',
    'section-bottom': 'var(--spacing-section-bottom, 5rem)',
    'section-gap': 'var(--spacing-section-gap, 3.5rem)'
  },
  colors: {
    'surface-overlay': 'oklch(var(--color-surface-overlay) / <alpha-value>)',
    'content-secondary': 'oklch(var(--color-content-secondary) / <alpha-value>)'
  }
}
```

### 4. **Accessibility by Default**
Per [WCAG 2025 requirements](https://www.nngroup.com/articles/ux-reset-2025/):
- Implement focus-visible states on all interactive elements
- Ensure 4.5:1 contrast ratio for normal text
- Add ARIA labels for all icon buttons
- Support keyboard navigation throughout

## SOLID Principles for React Components

Based on [SOLID principles in React](https://medium.com/byborg-engineering/applying-solid-to-react-ca6d1ff926a4) and [frontend architecture patterns](https://konstantinlebedev.com/solid-in-react/):

### 1. **Single Responsibility Principle (SRP)**
```tsx
// ❌ BAD: Component doing too much
function ProductCard({ product, onAddToCart, user, analytics }) {
  // Handles display, cart logic, analytics, user checks
}

// ✅ GOOD: Separated concerns
function ProductCard({ product }: { product: Product }) {
  return <ProductDisplay product={product} />
}

function useCartActions() {
  // Cart logic separated into hook
}

function useProductAnalytics() {
  // Analytics logic separated
}
```

### 2. **Open/Closed Principle (OCP)**
```tsx
// ✅ GOOD: Extensible via composition
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

// Can extend without modifying base component
<Button variant="primary" asChild>
  <Link href="/store">Shop Now</Link>
</Button>
```

### 3. **Liskov Substitution Principle (LSP)**
```tsx
// ✅ GOOD: Components with same interface are interchangeable
interface CardProps {
  title: string
  description: string
  action?: () => void
}

function ProductCard(props: CardProps) { }
function BlogCard(props: CardProps) { }
function TestimonialCard(props: CardProps) { }

// All can be used interchangeably
<CardGrid items={items} CardComponent={ProductCard} />
```

### 4. **Interface Segregation Principle (ISP)**
```tsx
// ❌ BAD: Component depends on entire product object
function ProductPrice({ product }: { product: Product }) {
  return <span>{formatPrice(product.price)}</span>
}

// ✅ GOOD: Component only receives what it needs
function ProductPrice({ price }: { price: number }) {
  return <span>{formatPrice(price)}</span>
}
```

### 5. **Dependency Inversion Principle (DIP)**
```tsx
// ✅ GOOD: Depend on abstractions
interface PaymentService {
  processPayment(amount: number): Promise<PaymentResult>
}

function CheckoutForm({ paymentService }: { paymentService: PaymentService }) {
  // Component doesn't care about specific payment implementation
}
```

## Specific Fixes Required

### 1. **Create Design Token System**
```bash
# Create new file: src/styles/tokens.ts
```

```typescript
export const designTokens = {
  // Spacing scale (rem-based for accessibility)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    'section-y': '5rem', // 80px
    'section-x': '1.5rem', // 24px mobile, extends on larger screens
  },

  // Semantic color tokens
  colors: {
    // Surface colors
    'surface-primary': 'var(--color-black-rich)',
    'surface-secondary': 'var(--color-cream)',
    'surface-overlay': 'var(--color-black-rich-80)',

    // Content colors
    'content-primary': 'var(--color-white)',
    'content-secondary': 'var(--color-white-70)',
    'content-inverse': 'var(--color-black-rich)',

    // Brand colors
    'brand-opal': 'var(--color-opal-electric)',
    'brand-fire': 'var(--color-fire-pink)',
    'brand-emerald': 'var(--color-opal-emerald)',
  },

  // Animation tokens
  motion: {
    'duration-fast': '150ms',
    'duration-normal': '300ms',
    'duration-slow': '500ms',
    'easing-default': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'easing-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  }
}
```

### 2. **Implement Consistent Image Component**
```tsx
// Create: src/components/ui/OptimizedImage.tsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9'
  priority?: boolean
  quality?: number
  className?: string
  sizes?: string
}

export function OptimizedImage({
  aspectRatio = '16:9',
  quality = 85,
  sizes = '100vw',
  ...props
}: OptimizedImageProps) {
  const aspectRatioClass = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-4/3',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]'
  }[aspectRatio]

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass, props.className)}>
      <Image
        fill
        sizes={sizes}
        quality={quality}
        className="object-cover"
        {...props}
      />
    </div>
  )
}
```

### 3. **Add Component Error Boundaries**
```tsx
// Create: src/components/ErrorBoundary.tsx
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: (error: Error, reset: () => void) => ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught:', error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset)
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">We encountered an error while loading this section.</p>
          <Button onClick={this.reset}>Try Again</Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 4. **Implement Accessibility Features**
```tsx
// Add to src/app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Navigation />

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <Footer />
    </>
  )
}
```

### 5. **Add Form Validation Schemas**
```tsx
// Create: src/lib/validations/forms.ts
import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

export const checkoutFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number'),
  shippingAddress: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().regex(/^\d{4}$/, 'Please enter a valid Australian postcode'),
    country: z.literal('AU')
  })
})

export type ContactFormData = z.infer<typeof contactFormSchema>
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
```

## Implementation Guidelines

### Phase 1: Foundation (Week 1)
1. **Design Tokens**
   - [ ] Create token system in `src/styles/tokens.ts`
   - [ ] Update Tailwind config to use tokens
   - [ ] Replace hardcoded values with tokens

2. **Image Optimization**
   - [ ] Create `OptimizedImage` component
   - [ ] Replace all `<img>` tags with `OptimizedImage`
   - [ ] Add proper loading states

### Phase 2: Component Architecture (Week 2)
1. **Error Handling**
   - [ ] Implement `ErrorBoundary` component
   - [ ] Wrap critical components
   - [ ] Add error logging service

2. **Accessibility**
   - [ ] Add skip links
   - [ ] Audit color contrast
   - [ ] Implement focus management

### Phase 3: Forms & Validation (Week 3)
1. **Schema Validation**
   - [ ] Create validation schemas
   - [ ] Integrate with forms
   - [ ] Add error messaging

2. **User Feedback**
   - [ ] Enhance toast notifications
   - [ ] Add loading states
   - [ ] Implement optimistic updates

### Phase 4: Performance & Polish (Week 4)
1. **Performance Optimization**
   - [ ] Implement code splitting
   - [ ] Add lazy loading
   - [ ] Optimize animations

2. **Testing & Documentation**
   - [ ] Add component tests
   - [ ] Create Storybook stories
   - [ ] Document patterns

## Quality Checklist

Before marking any UI/UX task as complete, verify:

### ✅ Code Quality
- [ ] No hardcoded values (colors, spacing, sizes)
- [ ] Proper TypeScript types (no `any`)
- [ ] SOLID principles applied
- [ ] Error boundaries in place
- [ ] Loading states implemented

### ✅ Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader friendly
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels where needed

### ✅ Performance
- [ ] Images optimized with Next.js Image
- [ ] Code split where appropriate
- [ ] Animations use transform/opacity
- [ ] No layout shift (CLS < 0.1)
- [ ] Fast interaction (INP < 200ms)

### ✅ Consistency
- [ ] Uses design tokens
- [ ] Follows component patterns
- [ ] Matches brand guidelines
- [ ] Responsive on all devices
- [ ] Works in light/dark modes

### ✅ User Experience
- [ ] Clear error messages
- [ ] Helpful empty states
- [ ] Smooth transitions
- [ ] Fast perceived performance
- [ ] Delightful micro-interactions

## Example Implementation

Here's a complete example fixing a problematic component:

```tsx
// ❌ BEFORE: Multiple issues
export function ProductCard({ product }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
      <h3 className="text-xl font-bold mb-2 text-black">{product.name}</h3>
      <p className="text-gray-600 mb-4">{formatPrice(product.price)}</p>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add to Cart
      </button>
    </div>
  )
}

// ✅ AFTER: Following all guidelines
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { withErrorBoundary } from '@/components/ErrorBoundary'

interface ProductCardProps {
  name: string
  price: number
  image: string
  imageAlt: string
  onAddToCart: () => void
}

function ProductCardComponent({
  name,
  price,
  image,
  imageAlt,
  onAddToCart
}: ProductCardProps) {
  return (
    <article className="bg-surface-card p-spacing-md rounded-lg shadow-elevation-low hover:shadow-elevation-high transition-shadow duration-motion-normal">
      <OptimizedImage
        src={image}
        alt={imageAlt}
        aspectRatio="4:3"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="mb-spacing-sm"
      />

      <h3 className="text-heading-sm font-bold mb-spacing-xs text-content-primary">
        {name}
      </h3>

      <p className="text-body-md text-content-secondary mb-spacing-sm" aria-label={`Price: ${formatPrice(price)}`}>
        {formatPrice(price)}
      </p>

      <Button
        onClick={onAddToCart}
        variant="primary"
        size="md"
        className="w-full"
        aria-label={`Add ${name} to cart`}
      >
        Add to Cart
      </Button>
    </article>
  )
}

export const ProductCard = withErrorBoundary(ProductCardComponent)
```

## Resources

### 2025 UI/UX Best Practices
- [UX Design Trends 2025](https://www.fullstack.com/labs/resources/blog/top-5-ux-ui-design-trends-in-2025-the-future-of-user-experiences)
- [The State of UX in 2025](https://trends.uxdesign.cc/)
- [Web App UI/UX Best Practices](https://cygnis.co/blog/web-app-ui-ux-best-practices-2025/)
- [Design System Architecture](https://ui-deploy.com/blog/complete-design-system-documentation-guide-how-to-create-scalable-component-libraries-2025)

### SOLID Principles in React
- [Applying SOLID To React](https://medium.com/byborg-engineering/applying-solid-to-react-ca6d1ff926a4)
- [SOLID Principles in React](https://konstantinlebedev.com/solid-in-react/)
- [Frontend Masters: SOLID in React](https://stackademic.com/blog/react-native-masters-solid-principles-in-react-react-native-a1b8df8d261d)

### Performance & Accessibility
- [Core Web Vitals](https://web.dev/vitals/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Performance Patterns](https://www.patterns.dev/react/render-props-pattern)

---

**Remember**: The goal is not perfection but continuous improvement. Focus on high-impact changes that improve user experience while maintaining code quality and developer productivity.