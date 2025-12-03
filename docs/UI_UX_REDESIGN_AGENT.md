# The Good Opal Co - UI/UX Redesign Agent Instructions

> **AGENT DIRECTIVE**: This document contains step-by-step instructions for transforming The Good Opal Co website. Execute each phase in order. Each task includes exact file paths, complete code, and verification steps.

---

## Context

**Brand Identity (from logo `/public/logo.png`):**
- Vibrant iridescent opal with electric blues, hot pinks, emerald greens, sunset oranges
- Clean sans-serif typography in charcoal
- Tagline: "Australian Opal That Doesn't Cost The Earth"
- Vibe: Modern, vibrant, accessible luxury, Australian

**Current Problems:**
- Cream/charcoal palette feels dated and corporate
- Hero images are product photos, not atmospheric/lifestyle
- shadcn components use default styling with no customization
- No Magic UI or advanced Framer Motion animations
- Typography (Playfair + Montserrat) feels 2018
- Opals look best on DARK backgrounds but site uses light

**Target Aesthetic:**
- "Quiet luxury" like Tiffany, Cartier, Sarah & Sebastian
- Dark product showcases that make opals pop
- Iridescent/shimmer effects evoking opal play-of-color
- Generous whitespace, refined typography
- Smooth animations with purpose

---

## Phase 1: Foundation

### Task 1.1: Update Color Palette

**File:** `/Users/dylanhenderson/the-good-opal-co/tailwind.config.ts`

**Action:** Replace the colors section with the following opal-derived palette:

```typescript
colors: {
  // Opal Electric Blues (from logo)
  'opal-electric': '#00B4D8',
  'opal-deep': '#0077B6',
  'opal-light': '#90E0EF',
  'opal-sky': '#CAF0F8',

  // Opal Fire Accents (from logo)
  'fire-coral': '#FF6B6B',
  'fire-pink': '#FF8FAB',
  'fire-orange': '#FF9F43',
  'fire-gold': '#FFD93D',

  // Opal Greens (from logo)
  'opal-emerald': '#2ECC71',
  'opal-teal': '#48D1CC',
  'opal-mint': '#A8E6CF',

  // Refined Neutrals
  'white-pure': '#FFFFFF',
  'white-warm': '#FEFDFB',
  'gray-whisper': '#F8F7F6',
  'gray-soft': '#E8E6E3',
  'charcoal-light': '#6B6966',
  'charcoal': '#2C2C2C',
  'charcoal-dark': '#1A1A1A',
  'black-rich': '#0A0A12',

  // Keep existing for backwards compatibility
  'opal-blue': {
    pale: '#E6F4FA',
    light: '#B3DCF0',
    DEFAULT: '#1B4B7C',
    dark: '#123456',
  },
  // ... keep rest of existing colors
}
```

**Verify:** Run `pnpm build` - no TypeScript errors.

---

### Task 1.2: Add New Animations

**File:** `/Users/dylanhenderson/the-good-opal-co/tailwind.config.ts`

**Action:** Add these to the `animation` and `keyframes` sections:

```typescript
animation: {
  // Keep existing animations, add:
  'shimmer-slide': 'shimmer-slide 2s linear infinite',
  'float': 'float 6s ease-in-out infinite',
  'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  'gradient-shift': 'gradient-shift 8s linear infinite',
  'fade-up': 'fade-up 0.5s ease-out forwards',
  'scale-in': 'scale-in 0.3s ease-out forwards',
},
keyframes: {
  // Keep existing keyframes, add:
  'shimmer-slide': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'float': {
    '0%, 100%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
  },
  'pulse-glow': {
    '0%, 100%': { boxShadow: '0 0 20px rgba(0, 180, 216, 0.3)' },
    '50%': { boxShadow: '0 0 40px rgba(0, 180, 216, 0.6)' },
  },
  'gradient-shift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
  'fade-up': {
    '0%': { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'scale-in': {
    '0%': { opacity: '0', transform: 'scale(0.95)' },
    '100%': { opacity: '1', transform: 'scale(1)' },
  },
},
```

**Verify:** Run `pnpm build` - no errors.

---

### Task 1.3: Update Global CSS Variables

**File:** `/Users/dylanhenderson/the-good-opal-co/src/app/globals.css`

**Action:** Add these CSS custom properties after the existing `:root` block:

```css
/* Opal-Inspired Design Tokens */
:root {
  /* Gradients */
  --gradient-opal-shimmer: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 180, 216, 0.4) 25%,
    rgba(255, 107, 107, 0.4) 50%,
    rgba(46, 204, 113, 0.4) 75%,
    transparent 100%
  );

  --gradient-hero: linear-gradient(
    135deg,
    #0A0A12 0%,
    #1a1a2e 50%,
    #16213e 100%
  );

  --gradient-cta: linear-gradient(
    135deg,
    #00B4D8 0%,
    #0077B6 100%
  );

  --gradient-prismatic: linear-gradient(
    90deg,
    #00B4D8,
    #FF8FAB,
    #2ECC71,
    #FF9F43,
    #00B4D8
  );
}

/* Utility Classes */
.text-gradient-prismatic {
  background: var(--gradient-prismatic);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 8s linear infinite;
}

.bg-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.bg-glass-dark {
  background: rgba(10, 10, 18, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.shadow-glow {
  box-shadow: 0 0 30px rgba(0, 180, 216, 0.2);
}

.shadow-glow-lg {
  box-shadow: 0 0 60px rgba(0, 180, 216, 0.3);
}

.border-gradient {
  border: 1px solid transparent;
  background: linear-gradient(var(--background), var(--background)) padding-box,
              var(--gradient-prismatic) border-box;
}
```

**Verify:** Refresh dev server, no CSS errors in console.

---

### Task 1.4: Install Framer Motion (if not present)

**Action:** Check if framer-motion is installed, install if missing:

```bash
pnpm add framer-motion
```

**Verify:** Check `package.json` contains `"framer-motion"`.

---

## Phase 2: Component Upgrades

### Task 2.1: Create Enhanced Button Component

**File:** `/Users/dylanhenderson/the-good-opal-co/src/components/ui/button.tsx`

**Action:** Replace entire file contents with:

```tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-opal-electric to-opal-deep text-white shadow-lg shadow-opal-electric/25 hover:shadow-xl hover:shadow-opal-electric/35 hover:scale-[1.02] active:scale-[0.98]',
        destructive:
          'bg-fire-coral text-white shadow-sm hover:bg-fire-coral/90',
        outline:
          'border-2 border-charcoal bg-transparent text-charcoal hover:bg-charcoal hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-charcoal',
        secondary:
          'bg-charcoal/5 text-charcoal hover:bg-charcoal/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
        ghost:
          'text-charcoal hover:bg-charcoal/5 dark:text-white dark:hover:bg-white/10',
        link:
          'text-opal-electric underline-offset-4 hover:underline',
        glass:
          'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
        shimmer:
          'bg-gradient-to-r from-opal-electric via-fire-pink to-opal-emerald bg-[length:200%_100%] animate-shimmer-slide text-white font-semibold shadow-xl hover:shadow-2xl',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Verify:** Build passes, buttons render with new styles.

---

### Task 2.2: Create Enhanced ProductCard Component

**File:** `/Users/dylanhenderson/the-good-opal-co/src/components/product/ProductCard.tsx`

**Action:** Replace entire file contents with:

```tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { Heart, ShoppingBag } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string
    slug: string
    name: string
    description: string
    price: number
    compareAtPrice?: number
    stock: number
    featured?: boolean
    category?: string
    image?: string
  }
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isAvailable = product.stock > 0

  return (
    <div
      className="group animate-fade-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
    >
      <Link href={`/store/${product.slug}`} className="block">
        {/* Image Container - DARK background for opal pop */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black-rich mb-4 shadow-lg group-hover:shadow-glow transition-all duration-500">
          {/* Gradient Border on Hover */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-pink to-opal-emerald opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[1px]">
            <div className="absolute inset-[1px] rounded-2xl bg-black-rich" />
          </div>

          {/* Product Image */}
          <div className="relative w-full h-full">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-700 ease-out ${
                  isAvailable
                    ? 'group-hover:scale-105'
                    : 'grayscale opacity-60'
                }`}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/placeholder-opal.jpg"
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${
                  isAvailable
                    ? 'group-hover:scale-105'
                    : 'grayscale opacity-60'
                }`}
              />
            )}
          </div>

          {/* Sold Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="bg-black-rich/90 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10">
                <span className="text-white font-medium tracking-wide text-sm">Collected</span>
              </div>
            </div>
          )}

          {/* Quick Actions on Hover */}
          {isAvailable && (
            <div
              className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <div className="flex gap-2">
                <AddToCartButton
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                  }}
                  className="flex-1 bg-white text-charcoal hover:bg-opal-electric hover:text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all duration-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </AddToCartButton>
                <button
                  className="w-12 h-12 bg-white rounded-xl flex items-center justify-center hover:bg-fire-pink hover:text-white shadow-lg transition-all duration-200"
                  aria-label="Add to wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-opal-electric to-fire-pink rounded-full z-10">
              <span className="text-xs font-semibold text-white">Featured</span>
            </div>
          )}

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full z-10">
              <span className="text-xs font-medium text-charcoal capitalize">{product.category}</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2 px-1">
          <h3 className={`font-medium text-base leading-snug transition-colors duration-200 line-clamp-2 ${
            isAvailable
              ? 'text-charcoal group-hover:text-opal-electric'
              : 'text-charcoal-light'
          }`}>
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            {isAvailable ? (
              <>
                <span className="text-lg font-bold text-opal-deep">
                  {formatCurrency(product.price, 'AUD')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-charcoal-light line-through">
                    {formatCurrency(product.compareAtPrice, 'AUD')}
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm font-medium text-charcoal-light">
                No longer available
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
```

**Verify:** Product cards render with dark backgrounds and new hover effects.

---

### Task 2.3: Create New Hero Component

**File:** `/Users/dylanhenderson/the-good-opal-co/src/components/sections/HeroSection.tsx`

**Action:** Create new file with:

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black-rich">
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full opacity-30 blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, #00B4D8 0%, transparent 70%)',
            animationDelay: '0s',
          }}
        />
        <div
          className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full opacity-30 blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, #FF8FAB 0%, transparent 70%)',
            animationDelay: '-3s',
          }}
        />
        <div
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full opacity-20 blur-3xl animate-float"
          style={{
            background: 'radial-gradient(circle, #2ECC71 0%, transparent 70%)',
            animationDelay: '-6s',
          }}
        />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 text-center px-6 max-w-5xl mx-auto transition-all duration-1000 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Eyebrow */}
        <p
          className="text-opal-light uppercase tracking-[0.3em] text-sm mb-6 transition-all duration-700 delay-200"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          Australian Opal That Doesn't Cost The Earth
        </p>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-8 leading-[1.05] tracking-tight">
          <span className="block">Discover the</span>
          <span className="text-gradient-prismatic font-normal">Magic of Opal</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          Handcrafted Australian opals, ethically sourced and transformed into
          wearable art. Each piece is one-of-a-kind, just like you.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="xl" variant="shimmer" asChild>
            <Link href="/store">Shop Collection</Link>
          </Button>
          <Button size="xl" variant="glass" asChild>
            <Link href="/about">Our Story</Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-10 h-16 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <ChevronDown className="w-5 h-5 text-white/50" />
        </div>
      </div>
    </section>
  )
}
```

**Verify:** Component renders without errors when imported.

---

### Task 2.4: Create Trust Marquee Component

**File:** `/Users/dylanhenderson/the-good-opal-co/src/components/sections/TrustMarquee.tsx`

**Action:** Create new file with:

```tsx
export function TrustMarquee() {
  const items = [
    'Handcrafted in Australia',
    'Ethically Sourced',
    'Free Express Shipping',
    '1 Year Warranty',
    'Certificate of Authenticity',
    'Premium Packaging',
  ]

  return (
    <div className="bg-opal-electric py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-8 text-sm font-medium text-white uppercase tracking-widest flex items-center gap-3"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
```

**Action:** Add marquee animation to `/Users/dylanhenderson/the-good-opal-co/tailwind.config.ts`:

```typescript
// Add to animation:
'marquee': 'marquee 30s linear infinite',

// Add to keyframes:
'marquee': {
  '0%': { transform: 'translateX(0%)' },
  '100%': { transform: 'translateX(-50%)' },
},
```

**Verify:** Marquee scrolls smoothly across the screen.

---

## Phase 3: Homepage Redesign

### Task 3.1: Update Homepage Layout

**File:** `/Users/dylanhenderson/the-good-opal-co/src/app/(marketing)/page.tsx`

**Action:** Replace the hero section (lines 30-31) with:

```tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustMarquee } from '@/components/sections/TrustMarquee'

// In the component, replace <HeroCarousel /> with:
<HeroSection />
<TrustMarquee />
```

**Action:** Update section backgrounds throughout the page:
- Change `bg-cream` to `bg-gray-whisper` or `bg-white`
- Change product showcase sections to `bg-black-rich` with `text-white`
- Update button classes to use new variants

**Verify:** Homepage renders with new hero and trust bar.

---

### Task 3.2: Update Featured Products Section Background

**File:** `/Users/dylanhenderson/the-good-opal-co/src/app/(marketing)/page.tsx`

**Action:** Find the FeaturedProducts section (around line 84) and update:

```tsx
{/* Shop Picks - DARK background for opal pop */}
<section className="bg-black-rich py-20 md:py-28">
  <div className="max-w-screen-xl mx-auto px-6">
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
        Shop <span className="text-gradient-prismatic">Picks</span>
      </h2>
      <p className="text-lg text-white/60 max-w-2xl mx-auto">
        Handpicked treasures from our collection
      </p>
    </div>
    <FeaturedProducts limit={4} featured={true} />
    <div className="text-center mt-12">
      <Button variant="glass" size="lg" asChild>
        <Link href="/store">View All Products</Link>
      </Button>
    </div>
  </div>
</section>
```

**Verify:** Featured products appear on dark background.

---

### Task 3.3: Update Category Grid Styling

**File:** `/Users/dylanhenderson/the-good-opal-co/src/app/(marketing)/page.tsx`

**Action:** Update category cards (around lines 97-180) to have darker overlays and better hover effects:

```tsx
{/* Category Card Example */}
<Link
  href="/store?category=raw-opals"
  className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-glow transition-all duration-500"
>
  <div className="aspect-square relative bg-black-rich">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src="/api/media/file/20210627_202327-3.jpg"
      alt="Raw Australian Opals"
      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black-rich via-black-rich/40 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
      <h3 className="text-xl font-semibold text-white tracking-wide">OPALS</h3>
    </div>
  </div>
</Link>
```

**Verify:** Categories have darker, more luxurious appearance.

---

## Phase 4: Store Page Enhancement

### Task 4.1: Add Dark Product Grid Section

**File:** `/Users/dylanhenderson/the-good-opal-co/src/app/(marketing)/store/page.tsx`

**Action:** Wrap the products section in a dark container:

```tsx
{/* Products Section */}
<section className="py-8 bg-gradient-to-b from-white via-gray-whisper to-black-rich">
  <Container>
    {/* Filter bar here */}
    <div className="bg-black-rich rounded-3xl p-8 md:p-12 shadow-2xl">
      <Suspense fallback={<ProductsSkeleton />}>
        <StoreContent products={transformedProducts} />
      </Suspense>
    </div>
  </Container>
</section>
```

**Verify:** Products display on dark background.

---

## Phase 5: Polish & Verification

### Task 5.1: Update Navigation Styling

**File:** `/Users/dylanhenderson/the-good-opal-co/src/components/navigation/Navigation.tsx`

**Action:** Add glass effect on scroll:

```tsx
// Add state for scroll
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 20)
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])

// Update header className:
className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
  scrolled
    ? 'bg-white/80 backdrop-blur-xl shadow-lg'
    : 'bg-transparent'
}`}
```

**Verify:** Navigation becomes glass-like on scroll.

---

### Task 5.2: Final Build Check

**Action:** Run full build:

```bash
pnpm build
```

**Verify:** No TypeScript or build errors.

---

## Image Recommendations

**Current hero images are product photos - they should be replaced with:**

1. **Atmospheric opal macro** - Extreme close-up showing play-of-color
2. **Lifestyle shot** - Model wearing jewelry in Australian landscape
3. **Workshop/craft shot** - Hands working on opal

**For now, use opal-1.jpg as it has the best colors.**

**Product images display best on dark backgrounds - the black-rich (#0A0A12) color is specifically chosen to make opal colors pop.**

---

## Quick Reference

### New Color Classes
- `bg-black-rich` - Product showcases
- `bg-opal-electric` - Primary accent
- `text-gradient-prismatic` - Animated gradient text
- `shadow-glow` - Subtle opal glow effect

### New Button Variants
- `variant="shimmer"` - Animated gradient CTA
- `variant="glass"` - Glassmorphism secondary

### New Animations
- `animate-float` - Gentle floating motion
- `animate-fade-up` - Fade in from below
- `animate-shimmer-slide` - Gradient movement
- `animate-marquee` - Infinite scroll

---

## Execution Order

1. Phase 1 tasks (foundation) - Must complete first
2. Phase 2 tasks (components) - Depends on Phase 1
3. Phase 3 tasks (homepage) - Depends on Phase 2
4. Phase 4 tasks (store) - Can run parallel to Phase 3
5. Phase 5 tasks (polish) - Final

**Total estimated tasks: 15**
**Dependencies: Sequential within phases, some parallel between phases**
