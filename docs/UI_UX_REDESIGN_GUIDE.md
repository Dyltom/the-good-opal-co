# The Good Opal Co - UI/UX Redesign Guide

> **For Claude Code Agent Implementation**
>
> This document provides comprehensive direction for transforming The Good Opal Co website into a modern, classy, vibey, new-age Australian opal jewelry e-commerce experience that matches the brand's stunning logo.

---

## Table of Contents

1. [Brand Analysis & Vision](#1-brand-analysis--vision)
2. [Current State Assessment](#2-current-state-assessment)
3. [2025 Luxury Jewelry E-Commerce Best Practices](#3-2025-luxury-jewelry-e-commerce-best-practices)
4. [Color System Overhaul](#4-color-system-overhaul)
5. [Typography Revolution](#5-typography-revolution)
6. [Component Library Enhancement](#6-component-library-enhancement)
7. [Page-by-Page Redesign Specifications](#7-page-by-page-redesign-specifications)
8. [Animation & Micro-Interactions](#8-animation--micro-interactions)
9. [Image Strategy](#9-image-strategy)
10. [Mobile-First Considerations](#10-mobile-first-considerations)
11. [Implementation Priority](#11-implementation-priority)

---

## 1. Brand Analysis & Vision

### The Logo Speaks Volumes

The Good Opal Co logo is a masterpiece that the current website completely fails to honor:

```
Logo Elements:
├── Circular badge design (modern yet timeless)
├── Vibrant, iridescent opal center
│   ├── Electric blues (#40E0D0, #1E90FF)
│   ├── Hot pinks/corals (#FF6B6B, #FF8C94)
│   ├── Emerald greens (#2ECC71)
│   ├── Sunset oranges (#FF9F43)
│   └── Flowing, organic patterns
├── Clean sans-serif typography (charcoal #2C2C2C)
└── Tagline: "Australian Opal That Doesn't Cost The Earth"
```

### Brand Personality Translation

| Logo Trait | Website Should Feel |
|------------|---------------------|
| Vibrant opal colors | Color pops, gradients, iridescent effects |
| Circular, organic shape | Soft curves, flowing layouts, rounded elements |
| Clean typography | Refined, minimal, generous whitespace |
| "Doesn't Cost The Earth" | Accessible luxury, approachable premium |
| Australian identity | Earthy warmth, natural textures, outback inspiration |

### Design Vision Statement

> **"A digital gallery where Australian opals dance with light—where every scroll reveals new colors, every interaction feels precious, and the shopping experience mirrors the magic of discovering an opal in the rough."**

---

## 2. Current State Assessment

### Critical Problems Identified

#### 2.1 Color Palette Mismatch

**Current State:**
```css
/* Dominant colors used */
bg-cream: #FAF9F6        /* Feels dated, not vibrant */
bg-charcoal: #2C2C2C     /* Too corporate */
opal-blue: #1B4B7C       /* Generic, not the electric blues in logo */
```

**Problem:** The cream/charcoal combination creates a **beige, corporate feel** rather than the vibrant, mystical opal experience the logo promises.

#### 2.2 Hero Section Failures

**Current Issues:**
- Using product photography (opals in boxes) as hero backgrounds
- Dark overlay obscures beautiful opal colors
- Generic slide counter typography ("01 / 03")
- Ken Burns effect is subtle to the point of being invisible
- No shimmer or iridescent effects that evoke opal magic

**File:** `src/components/sections/HeroCarousel.tsx:30-56`

#### 2.3 shadcn/ui Underutilization

**Components installed but barely customized:**
```
src/components/ui/
├── button.tsx         # Basic variants, no luxury feel
├── card.tsx           # Generic, no glassmorphism
├── input.tsx          # Plain, no animated focus states
├── sheet.tsx          # Cart drawer - functional but not beautiful
└── ... (19 components - mostly default styles)
```

**Missing:**
- Magic UI components (not installed)
- Framer Motion animations (installed but underused)
- Aceternity UI effects
- Custom animated components

#### 2.4 Typography Issues

**Current:**
```javascript
// tailwind.config.ts
fontFamily: {
  sans: ['Montserrat', 'Inter', 'sans-serif'],
  serif: ['Playfair Display', 'serif'],
  heading: ['Playfair Display', 'serif'],
}
```

**Problems:**
- Playfair Display is overused and feels 2018
- Montserrat is safe but lacks luxury character
- No display/accent fonts for impact
- Line heights and letter spacing not optimized

#### 2.5 Layout & Spacing

**Issues:**
- Inconsistent section padding (py-20 vs py-28 vs py-24)
- Too much cream background - creates visual monotony
- Card designs feel "template-y"
- No visual rhythm or intentional pacing

#### 2.6 Product Card Problems

**File:** `src/components/product/ProductCard.tsx`

**Issues:**
- Basic hover effects (scale 1.03 is barely perceptible)
- No image treatment (no subtle border, no shadow layering)
- Price typography is generic
- "Already Collected" overlay blocks entire product

#### 2.7 Hero Images Assessment

**Current Hero Images:**
| Image | Content | Problem |
|-------|---------|---------|
| opal-1.jpg | Blue opals in display box, black bg | Good colors, bad composition for hero |
| opal-2.jpg | Mixed opals in boxes, muted colors | Poor lighting, not hero-worthy |
| opal-3.jpg | Single cream opal in box | Beautiful but too product-focused |

**Verdict:** These are **product photos, not hero images**. Heroes need lifestyle, atmosphere, and scale.

---

## 3. 2025 Luxury Jewelry E-Commerce Best Practices

### 3.1 Visual Design Principles

Based on research from [Tiffany & Co](https://www.tiffany.com), [Cartier](https://www.cartier.com), and [2025 jewelry design trends](https://10web.io/blog/jewelry-website-examples/):

#### The "Quiet Luxury" Movement
- **Minimalist layouts** with maximum product focus
- **Generous whitespace** that lets products breathe
- **Subtle animations** that feel intentional, not gratuitous
- **Editorial-style product presentation**

#### Key Design Elements

```
1. BACKGROUNDS
   ├── Pure white (#FFFFFF) for product areas
   ├── Soft off-white (#FAFAFA) for sections
   ├── Deep blacks for drama (#0A0A0A)
   └── Subtle gradients (avoid flat colors)

2. PRODUCT PHOTOGRAPHY
   ├── Multiple angles per product
   ├── 360° views where possible
   ├── Lifestyle/on-model imagery
   ├── Macro detail shots
   └── Consistent lighting across catalog

3. TYPOGRAPHY HIERARCHY
   ├── One impactful display font
   ├── One refined body font
   ├── Generous line-height (1.6-1.8)
   └── Strategic letter-spacing

4. NAVIGATION
   ├── Fixed, transparent on scroll
   ├── Minimal items (3-5 max)
   ├── Mega menus for categories
   └── Search prominently featured
```

### 3.2 Conversion-Focused UX

From [Baymard Institute research](https://baymard.com/blog/current-state-ecommerce-product-page-ux):

```
HIGH-IMPACT FEATURES:
├── Guest checkout (mandatory)
├── Progress indicators in checkout
├── Trust badges near price
├── Clear shipping information
├── Easy returns messaging
├── Multiple payment options visible
└── Mobile-first checkout flow

PRODUCT PAGE ESSENTIALS:
├── Large, zoomable images (minimum 5)
├── Price prominence (above fold)
├── Stock availability status
├── Delivery estimates
├── Size/specification details
├── Customer reviews integration
└── Related products section
```

### 3.3 Australian/Opal-Specific Opportunities

From [Black Star Opal trends](https://www.blackstaropal.com/blogs/news/opal-jewelry-trends-for-2025-a-dazzling-year-ahead):

```
OPAL STORYTELLING:
├── Origin information (Lightning Ridge, Coober Pedy, etc.)
├── Play-of-color descriptions
├── Care instructions
├── Authentication certificates
├── Mining story/ethical sourcing
└── Educational content integration

VISUAL TREATMENTS:
├── Iridescent/holographic effects in UI
├── Prismatic color gradients
├── Light-play animations
├── Dark mode for opal pop
└── Macro photography zoom capability
```

---

## 4. Color System Overhaul

### 4.1 New Color Palette

**Derived directly from the logo opal:**

```css
:root {
  /* PRIMARY - Electric Opal Blue */
  --opal-electric: oklch(0.65 0.20 220);      /* #00B4D8 - Vibrant teal-blue */
  --opal-deep: oklch(0.45 0.18 230);          /* #0077B6 - Deep ocean blue */
  --opal-light: oklch(0.85 0.12 200);         /* #90E0EF - Light sky blue */

  /* ACCENT - Opal Fire */
  --fire-coral: oklch(0.70 0.18 25);          /* #FF6B6B - Warm coral */
  --fire-pink: oklch(0.75 0.15 350);          /* #FF8FAB - Soft pink */
  --fire-orange: oklch(0.75 0.16 50);         /* #FF9F43 - Sunset orange */

  /* ACCENT - Opal Greens */
  --opal-emerald: oklch(0.65 0.18 160);       /* #2ECC71 - Flash green */
  --opal-teal: oklch(0.70 0.14 180);          /* #48D1CC - Medium teal */

  /* NEUTRALS - Refined */
  --white-pure: oklch(1 0 0);                  /* #FFFFFF */
  --white-warm: oklch(0.985 0.005 80);        /* #FEFDFB - Barely warm */
  --gray-whisper: oklch(0.97 0.003 80);       /* #F8F7F6 */
  --gray-soft: oklch(0.92 0.005 80);          /* #E8E6E3 */
  --charcoal-light: oklch(0.55 0.01 80);      /* #6B6966 */
  --charcoal: oklch(0.25 0.01 80);            /* #2C2C2C */
  --black-rich: oklch(0.10 0.02 280);         /* #0A0A12 - Blue-black */

  /* SPECIAL EFFECTS */
  --iridescent-1: linear-gradient(135deg, var(--opal-electric), var(--fire-pink), var(--opal-emerald));
  --iridescent-2: linear-gradient(45deg, var(--opal-deep), var(--fire-coral), var(--opal-teal));
  --shimmer: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}
```

### 4.2 Gradient System

```css
/* Hero Gradients */
.gradient-hero-opal {
  background: linear-gradient(
    135deg,
    oklch(0.20 0.03 240) 0%,      /* Deep blue-black */
    oklch(0.15 0.05 280) 50%,     /* Purple-black */
    oklch(0.12 0.03 320) 100%    /* Rose-black */
  );
}

/* Card Hover Gradients */
.gradient-card-glow {
  background: radial-gradient(
    ellipse at center,
    oklch(0.65 0.20 220 / 0.15) 0%,
    transparent 70%
  );
}

/* Button Gradients */
.gradient-cta {
  background: linear-gradient(
    135deg,
    var(--opal-electric) 0%,
    var(--opal-deep) 100%
  );
}

/* Prismatic Text */
.text-prismatic {
  background: linear-gradient(
    90deg,
    var(--opal-electric),
    var(--fire-pink),
    var(--opal-emerald),
    var(--fire-orange),
    var(--opal-electric)
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: prismatic-shift 8s linear infinite;
}

@keyframes prismatic-shift {
  to { background-position: 200% center; }
}
```

### 4.3 Dark Mode Strategy

**Opals look BEST on dark backgrounds.** Consider defaulting to dark or offering prominent toggle:

```css
.dark {
  --background: var(--black-rich);
  --foreground: var(--white-warm);
  --card: oklch(0.15 0.02 280);
  --card-foreground: var(--white-warm);

  /* Opals literally pop on dark backgrounds */
  /* This should be the DEFAULT for product pages */
}
```

---

## 5. Typography Revolution

### 5.1 New Font Stack

```javascript
// tailwind.config.ts
fontFamily: {
  // Display - For heroes and major headings
  display: ['Cormorant Garamond', 'Playfair Display', 'serif'],

  // Heading - For section titles
  heading: ['DM Serif Display', 'serif'],

  // Body - Clean and modern
  sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],

  // Accent - For CTAs and special text
  accent: ['Outfit', 'Montserrat', 'sans-serif'],
}
```

### 5.2 Type Scale

```css
/* Fluid typography using clamp() */
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.35vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem);
  --text-5xl: clamp(3rem, 2rem + 5vw, 5rem);
  --text-6xl: clamp(3.75rem, 2.5rem + 6.25vw, 7rem);
}
```

### 5.3 Typography Classes

```css
/* Hero Titles */
.text-hero {
  font-family: var(--font-display);
  font-size: var(--text-6xl);
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 1.05;
}

/* Section Titles */
.text-section {
  font-family: var(--font-heading);
  font-size: var(--text-4xl);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

/* Product Names */
.text-product {
  font-family: var(--font-sans);
  font-size: var(--text-lg);
  font-weight: 500;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

/* Prices - Make them sing */
.text-price {
  font-family: var(--font-accent);
  font-size: var(--text-xl);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--opal-electric);
}

/* Body Copy */
.text-body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.7;
  color: var(--charcoal-light);
}
```

---

## 6. Component Library Enhancement

### 6.1 Install Magic UI

```bash
# Install Magic UI for animated components
npx shadcn@latest add "https://magicui.design/r/shimmer-button"
npx shadcn@latest add "https://magicui.design/r/animated-gradient-text"
npx shadcn@latest add "https://magicui.design/r/blur-fade"
npx shadcn@latest add "https://magicui.design/r/particles"
npx shadcn@latest add "https://magicui.design/r/globe"
npx shadcn@latest add "https://magicui.design/r/sparkles"
npx shadcn@latest add "https://magicui.design/r/border-beam"
npx shadcn@latest add "https://magicui.design/r/shine-border"
```

### 6.2 Enhanced Button Component

**File:** `src/components/ui/button.tsx`

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'

const buttonVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary - Gradient with shine effect
        default: [
          'bg-gradient-to-r from-opal-electric to-opal-deep',
          'text-white shadow-lg shadow-opal-electric/25',
          'hover:shadow-xl hover:shadow-opal-electric/30',
          'hover:scale-[1.02] active:scale-[0.98]',
        ].join(' '),

        // Secondary - Glass effect
        secondary: [
          'bg-white/10 backdrop-blur-md',
          'text-charcoal dark:text-white',
          'border border-charcoal/10 dark:border-white/20',
          'hover:bg-white/20 hover:border-charcoal/20',
        ].join(' '),

        // Ghost - Minimal
        ghost: [
          'text-charcoal dark:text-white',
          'hover:bg-charcoal/5 dark:hover:bg-white/10',
        ].join(' '),

        // Outline - Elegant border
        outline: [
          'border-2 border-charcoal dark:border-white',
          'text-charcoal dark:text-white',
          'hover:bg-charcoal hover:text-white',
          'dark:hover:bg-white dark:hover:text-charcoal',
        ].join(' '),

        // Shimmer - Premium CTA
        shimmer: [
          'bg-gradient-to-r from-opal-electric via-fire-pink to-opal-emerald',
          'bg-[length:200%_100%]',
          'animate-shimmer-slide',
          'text-white font-semibold shadow-2xl',
        ].join(' '),
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        default: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

// Add shimmer animation to tailwind.config.ts:
// animation: { 'shimmer-slide': 'shimmer-slide 2s linear infinite' }
// keyframes: { 'shimmer-slide': { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } } }
```

### 6.3 Enhanced Card Component

**File:** `src/components/ui/card.tsx`

```tsx
const cardVariants = cva(
  'rounded-2xl transition-all duration-500',
  {
    variants: {
      variant: {
        // Default - Subtle elegance
        default: [
          'bg-white dark:bg-charcoal/50',
          'border border-gray-soft dark:border-white/10',
          'shadow-sm hover:shadow-xl',
          'hover:border-opal-electric/30',
        ].join(' '),

        // Glass - Modern glassmorphism
        glass: [
          'bg-white/60 dark:bg-charcoal/40',
          'backdrop-blur-xl',
          'border border-white/50 dark:border-white/10',
          'shadow-xl shadow-black/5',
        ].join(' '),

        // Glow - Accent with border glow
        glow: [
          'bg-white dark:bg-charcoal',
          'border border-transparent',
          'shadow-[0_0_30px_rgba(0,180,216,0.15)]',
          'hover:shadow-[0_0_40px_rgba(0,180,216,0.25)]',
        ].join(' '),

        // Dark - For product display
        dark: [
          'bg-black-rich',
          'border border-white/5',
          'shadow-2xl',
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
```

### 6.4 New ProductCard Component

**File:** `src/components/product/ProductCard.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatCurrency } from '@/lib/utils'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { ShoppingBag, Eye, Heart } from 'lucide-react'

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
    origin?: string
  }
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isAvailable = product.stock > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/store/${product.slug}`} className="block">
        {/* Image Container - Dark background for opal pop */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-black-rich mb-4">
          {/* Gradient border effect on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-[1px] rounded-2xl bg-black-rich" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-opal-electric via-fire-pink to-opal-emerald" style={{ padding: '1px' }} />
          </div>

          {/* Product Image */}
          <Image
            src={product.image || '/images/placeholder-opal.jpg'}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ease-out ${
              isAvailable
                ? 'group-hover:scale-105'
                : 'grayscale opacity-60'
            }`}
          />

          {/* Sold State */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-white font-medium tracking-wide">Collected</span>
              </div>
            </div>
          )}

          {/* Quick Actions - Appear on hover */}
          {isAvailable && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <AddToCartButton
                product={product}
                className="flex-1 bg-white/95 backdrop-blur text-charcoal hover:bg-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </AddToCartButton>
              <button className="w-12 h-12 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center hover:bg-white shadow-lg transition-colors">
                <Heart className="w-4 h-4 text-charcoal" />
              </button>
            </motion.div>
          )}

          {/* Origin Badge */}
          {product.origin && (
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
              <span className="text-xs font-medium text-charcoal">{product.origin}</span>
            </div>
          )}

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-opal-electric to-fire-pink rounded-full">
              <span className="text-xs font-medium text-white">Featured</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Category */}
          {product.category && (
            <p className="text-xs uppercase tracking-widest text-charcoal-light">
              {product.category}
            </p>
          )}

          {/* Name */}
          <h3 className="font-medium text-charcoal group-hover:text-opal-electric transition-colors duration-300 line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-opal-deep">
              {formatCurrency(product.price, 'AUD')}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-charcoal-light line-through">
                {formatCurrency(product.compareAtPrice, 'AUD')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
```

### 6.5 New HeroSection Component

**File:** `src/components/sections/HeroSection.tsx`

```tsx
'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Particles } from '@/components/magicui/particles'
import { SparklesCore } from '@/components/magicui/sparkles'

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-black-rich"
    >
      {/* Animated Background Particles */}
      <Particles
        className="absolute inset-0"
        quantity={100}
        staticity={30}
        color="#00B4D8"
      />

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-radial from-opal-electric/30 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-radial from-fire-pink/30 via-transparent to-transparent blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-opal-light uppercase tracking-[0.3em] text-sm mb-6"
        >
          Australian Opal That Doesn't Cost The Earth
        </motion.p>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-hero text-white mb-8"
        >
          <span className="block">Discover the</span>
          <span className="text-prismatic">Magic of Opal</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Handcrafted Australian opals, ethically sourced and transformed into
          wearable art. Each piece is one-of-a-kind, just like you.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="xl" variant="shimmer" asChild>
            <Link href="/store">Shop Collection</Link>
          </Button>
          <Button size="xl" variant="secondary" asChild>
            <Link href="/about">Our Story</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
```

---

## 7. Page-by-Page Redesign Specifications

### 7.1 Homepage

**Current Issues:**
- Generic carousel with product photos
- Cream background feels dated
- Reviews section looks templated
- Trust badges are boring icons

**New Structure:**

```
HOMEPAGE FLOW:
├── [HERO] Full-screen dark hero with particles
│   ├── Animated gradient orbs
│   ├── Prismatic animated title
│   ├── Clear value proposition
│   └── Dual CTAs (Shop / Story)
│
├── [MARQUEE] Infinite scroll trust strip
│   ├── "Handcrafted in Australia"
│   ├── "Ethically Sourced"
│   ├── "1 Year Warranty"
│   └── "Free Express Shipping"
│
├── [FEATURED] Featured products (4-6)
│   ├── Dark background section
│   ├── Large title with gradient
│   ├── Staggered card animations
│   └── "Shop All" link
│
├── [STORY] About section with parallax
│   ├── Full-width image (workshop/mining)
│   ├── Overlaid text content
│   ├── Stats (Years, Opals, Countries)
│   └── CTA to About page
│
├── [CATEGORIES] Category showcase
│   ├── Bento grid layout
│   ├── Large hero categories
│   ├── Hover state with scale
│   └── Category count badges
│
├── [TESTIMONIALS] Reviews carousel
│   ├── Card-based testimonials
│   ├── Auto-scrolling
│   ├── Star ratings
│   └── Photo/initials
│
├── [CTA] Custom commission block
│   ├── Gradient background
│   ├── Before/after images
│   └── Contact form trigger
│
├── [INSTAGRAM] Social feed
│   ├── Grid of UGC images
│   ├── Hover overlay with icons
│   └── Follow CTA
│
└── [FOOTER] Enhanced footer
    ├── Newsletter with shimmer button
    ├── Mega links grid
    ├── Payment badges
    └── Copyright
```

### 7.2 Store/Shop Page

**Current Issues:**
- Plain grid layout
- No filtering sophistication
- Weak header presence

**New Design:**

```
STORE PAGE:
├── [HEADER] Sticky filter bar
│   ├── Category pills (scrollable)
│   ├── Sort dropdown
│   ├── View toggle (grid/list)
│   └── Results count
│
├── [SIDEBAR] Filter panel (desktop)
│   ├── Price range slider
│   ├── Stone type checkboxes
│   ├── Origin selection
│   ├── Metal type
│   └── Clear filters button
│
├── [GRID] Products grid
│   ├── 4 columns desktop
│   ├── 3 columns tablet
│   ├── 2 columns mobile
│   ├── Staggered animation on load
│   └── Infinite scroll / Load more
│
└── [EMPTY] No results state
    ├── Friendly illustration
    ├── Suggested actions
    └── Popular products
```

### 7.3 Product Detail Page

**New Layout:**

```
PRODUCT PAGE:
├── [GALLERY] Image gallery (left 60%)
│   ├── Main image with zoom
│   ├── Thumbnail strip
│   ├── Lightbox on click
│   └── 360° view if available
│
├── [INFO] Product info (right 40%)
│   ├── Breadcrumb
│   ├── Category badge
│   ├── Product name (large)
│   ├── Price (prominent)
│   ├── Stock status
│   ├── Origin info
│   ├── Size selector (if applicable)
│   ├── Add to cart (sticky on scroll)
│   ├── Wishlist button
│   ├── Share buttons
│   └── Trust signals
│
├── [TABS] Details tabs
│   ├── Description
│   ├── Specifications
│   ├── Care instructions
│   └── Authenticity
│
├── [REVIEWS] Reviews section
│   ├── Rating summary
│   ├── Review cards
│   └── Write review CTA
│
└── [RELATED] Related products
    ├── "You May Also Like"
    └── Product card carousel
```

### 7.4 Cart Page

**Design Updates:**

```
CART PAGE:
├── [HEADER] Page title with item count
│
├── [ITEMS] Cart items (left 65%)
│   ├── Item cards
│   │   ├── Product image
│   │   ├── Name & variants
│   │   ├── Quantity selector
│   │   ├── Price
│   │   └── Remove button
│   └── Empty state if no items
│
├── [SUMMARY] Order summary (right 35%)
│   ├── Subtotal
│   ├── Shipping estimate
│   ├── Promo code input
│   ├── Total
│   ├── Checkout button
│   └── Continue shopping link
│
└── [UPSELL] You might also like
    └── 4 product cards
```

---

## 8. Animation & Micro-Interactions

### 8.1 Framer Motion Variants

```tsx
// src/lib/animations.ts

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
}

export const slideFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

// Opal shimmer effect
export const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: 'linear'
    }
  }
}
```

### 8.2 CSS Animations for globals.css

```css
/* Opal Shimmer Effect */
@keyframes opal-shimmer {
  0% {
    background-position: -200% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}

.animate-opal-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 180, 216, 0.4) 25%,
    rgba(255, 107, 107, 0.4) 50%,
    rgba(46, 204, 113, 0.4) 75%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: opal-shimmer 3s ease-in-out infinite;
}

/* Floating Animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Pulse Glow */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 180, 216, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 180, 216, 0.6);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Gradient Rotate */
@keyframes gradient-rotate {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

.animate-gradient-rotate {
  animation: gradient-rotate 10s linear infinite;
}
```

### 8.3 Micro-Interactions Checklist

```
BUTTONS:
├── Hover: Scale 1.02 + shadow increase
├── Active: Scale 0.98
├── Focus: Ring with brand color
└── Loading: Shimmer + spinner

CARDS:
├── Hover: Lift (translateY -4px) + shadow
├── Image: Subtle scale on hover
├── Border: Gradient reveal on hover
└── Content: Slight opacity change

INPUTS:
├── Focus: Border color + ring
├── Valid: Green checkmark
├── Invalid: Red border + shake
└── Typing: Subtle label animation

LINKS:
├── Hover: Underline animation
├── Active: Color shift
└── Visited: Subtle distinction

NAVIGATION:
├── Scroll: Blur + shadow on sticky
├── Mobile menu: Slide from right
├── Dropdown: Fade + slide down
└── Cart icon: Badge bounce on add

PAGE TRANSITIONS:
├── Route change: Fade
├── Section entry: Stagger up
└── Scroll reveal: Fade in
```

---

## 9. Image Strategy

### 9.1 Current Image Problems

| Category | Problem | Solution |
|----------|---------|----------|
| Hero images | Product photos, not aspirational | Commission lifestyle/atmospheric shots |
| Product photos | Inconsistent lighting/backgrounds | Standardize with black backgrounds |
| Category images | Mixed quality | Reshoot with consistent style |
| Missing images | No lifestyle/model shots | Add "worn" photography |

### 9.2 Image Requirements

**Hero Images Needed:**
```
1. hero-opal-macro.jpg
   - Extreme macro of opal with play-of-color
   - Abstract, can be used as background
   - Vibrant blues, greens, pinks visible

2. hero-workshop.jpg
   - Hands crafting jewelry
   - Shallow depth of field
   - Warm, inviting lighting

3. hero-lifestyle.jpg
   - Model wearing opal jewelry
   - Natural Australian setting
   - Golden hour lighting
```

**Product Photography Standards:**
```
REQUIREMENTS:
├── Black background (#0A0A0A)
├── Consistent lighting angle
├── Multiple angles (4 minimum)
├── Macro detail shot
├── Scale reference
├── True color representation
└── Minimum 2000x2000px
```

### 9.3 Using Available Images

**Best images in `/public/images/products/`:**
- Files with vibrant blue opals on black backgrounds
- Files showing finished jewelry pieces
- Macro shots with visible play-of-color

**Avoid:**
- Grainy or poorly lit images
- Images with visible dust/debris
- Overly processed/filtered images

### 9.4 Image Optimization

```tsx
// Use Next.js Image component everywhere
import Image from 'next/image'

// Configuration in next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

---

## 10. Mobile-First Considerations

### 10.1 Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base styles: Mobile (< 640px) */

@media (min-width: 640px) { /* sm: Landscape phones */ }
@media (min-width: 768px) { /* md: Tablets */ }
@media (min-width: 1024px) { /* lg: Laptops */ }
@media (min-width: 1280px) { /* xl: Desktops */ }
@media (min-width: 1536px) { /* 2xl: Large screens */ }
```

### 10.2 Mobile-Specific UI

```
NAVIGATION:
├── Hamburger menu
├── Bottom navigation bar consideration
├── Swipe gestures for cart
└── Thumb-friendly tap targets (48px min)

PRODUCT GRID:
├── 2 columns on mobile
├── Larger tap targets
├── Quick-view bottom sheet
└── Swipe between products

CHECKOUT:
├── Simplified single-column
├── Large form inputs
├── Apple Pay / Google Pay prominent
└── Progress stepper

CART:
├── Full-screen drawer
├── Swipe to remove items
├── Sticky checkout button
└── Easy quantity adjustment
```

### 10.3 Touch Interactions

```tsx
// Swipe detection hook
import { useSwipe } from '@/hooks/useSwipe'

// Implementation
const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide(),
  threshold: 50
})
```

---

## 11. Implementation Priority

### Phase 1: Foundation (Critical)

```
PRIORITY: HIGH
EFFORT: Medium

1. [ ] Update Tailwind config with new color palette
2. [ ] Install and configure Magic UI components
3. [ ] Create new typography system
4. [ ] Build enhanced Button component
5. [ ] Build enhanced Card component
6. [ ] Update globals.css with new animations
7. [ ] Create animation utilities file
```

### Phase 2: Core Components (High Impact)

```
PRIORITY: HIGH
EFFORT: High

1. [ ] New HeroSection component (dark, particles)
2. [ ] New ProductCard component (dark bg, hover effects)
3. [ ] New Navigation (glass, sticky behavior)
4. [ ] Enhanced Footer with newsletter
5. [ ] Trust badge marquee component
6. [ ] Category grid bento layout
```

### Phase 3: Page Redesigns

```
PRIORITY: MEDIUM-HIGH
EFFORT: High

1. [ ] Homepage complete redesign
2. [ ] Store page with filters
3. [ ] Product detail page
4. [ ] Cart page enhancements
5. [ ] Checkout flow improvements
```

### Phase 4: Polish & Delight

```
PRIORITY: MEDIUM
EFFORT: Medium

1. [ ] Page transitions
2. [ ] Loading states
3. [ ] Empty states
4. [ ] Error states
5. [ ] Success animations
6. [ ] Micro-interactions refinement
```

### Phase 5: Advanced Features

```
PRIORITY: LOW-MEDIUM
EFFORT: High

1. [ ] Dark mode toggle
2. [ ] 360° product views
3. [ ] Virtual try-on exploration
4. [ ] Instagram feed integration
5. [ ] Reviews system enhancement
```

---

## Quick Reference: Do's and Don'ts

### DO:
- Use black/dark backgrounds for product showcases
- Leverage the logo's vibrant opal colors throughout
- Create depth with subtle gradients and shadows
- Use generous whitespace
- Animate with purpose (entrance, feedback, delight)
- Maintain accessibility (contrast, focus states)
- Optimize images aggressively

### DON'T:
- Use cream as a dominant background color
- Leave shadcn components with default styles
- Overwhelm with animations
- Use generic stock photography
- Forget mobile users
- Skip loading and error states
- Use `<img>` instead of `<Image>`

---

## Resources & References

### Design Inspiration
- [Tiffany & Co](https://www.tiffany.com) - Minimalist luxury
- [Cartier](https://www.cartier.com) - Product-first design
- [Sarah & Sebastian](https://sarahandsebastian.com) - Australian elegance
- [Mejuri](https://mejuri.com) - Modern jewelry e-commerce

### Component Libraries
- [shadcn/ui](https://ui.shadcn.com/) - Base components
- [Magic UI](https://magicui.design/) - Animated components
- [Aceternity UI](https://ui.aceternity.com/) - Premium effects
- [Motion](https://motion.dev/) - Animation library

### Research Sources
- [Baymard Institute](https://baymard.com/blog/current-state-ecommerce-product-page-ux) - Product Page UX Best Practices 2025
- [10Web Jewelry Examples](https://10web.io/blog/jewelry-website-examples/) - 31 Jewelry Website Design Ideas
- [Black Star Opal](https://www.blackstaropal.com/blogs/news/opal-jewelry-trends-for-2025-a-dazzling-year-ahead) - Opal Jewelry Trends 2025
- [DesignRush](https://www.designrush.com/best-designs/websites/jewelry) - Best Jewelry Web Designs 2025
- [instinctools](https://www.instinctools.com/blog/ecommerce-ux-best-practices/) - Ecommerce UX Best Practices 2025

---

*Last Updated: December 2025*
*Created for The Good Opal Co UI/UX Redesign Initiative*
