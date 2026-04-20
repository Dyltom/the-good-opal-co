# Typography Improvement Plan - The Good Opal Co

## Current State Analysis

After analyzing the site's typography, I've identified several areas where font usage is inconsistent or not following the design system.

### Font Families Available
- **Inter** - Body text (sans-serif)
- **Playfair Display** - Headings (serif)
- **Montserrat** - Accent text (sans-serif)

### Issues Found

1. **Missing font-family specifications** - Most components use generic font weights without specifying which font family to use
2. **Inconsistent heading styles** - Some use `font-serif`, others don't
3. **Navigation/Footer** - Not using the proper font families
4. **Product cards** - Missing font-family classes
5. **Hero sections** - Some use `font-serif` correctly, others don't

## Improvement Areas

### 1. Navigation Component (`src/components/navigation/Navigation.tsx`)
**Current Issues:**
- Logo text uses generic `font-semibold` without font family
- Navigation links don't specify font family

**Fixes Needed:**
- Logo: Add `font-serif` for brand name
- Tagline: Use `font-accent` for "AUSTRALIAN OPALS"
- Navigation links: Ensure `font-sans` is applied

### 2. Footer Component (`src/components/navigation/Footer.tsx`)
**Current Issues:**
- Brand name uses generic styles
- Links and descriptions don't specify font families

**Fixes Needed:**
- Logo text: Add `font-serif`
- Footer links: Use `font-sans`
- Newsletter heading: Use `font-serif`

### 3. Product Hero (`src/components/sections/ProductHero.tsx`)
**Current Issues:**
- Already uses `font-serif` for main heading ✓
- Stats could use `font-accent` for emphasis

**Fixes Needed:**
- Add `font-accent` to stat numbers for visual hierarchy

### 4. Product Cards (`src/components/product/ProductCard.tsx`)
**Current Issues:**
- Product names don't use consistent font families
- Price display lacks font specifications

**Fixes Needed:**
- Product names: Add `font-serif` for elegance
- Prices: Use `font-sans` with proper weights
- Metadata: Use `font-sans` consistently

### 5. Store Page Headers
**Fixes Needed:**
- Ensure all page headers use `font-serif`
- Subheadings should use `font-sans`

### 6. Form Inputs and Buttons
**Fixes Needed:**
- Ensure all form inputs use `font-sans`
- Button text should be consistent with `font-sans`

## Implementation Priority

1. **High Priority** (Brand Consistency)
   - Navigation logo text
   - Footer brand text
   - Main page headings

2. **Medium Priority** (User Experience)
   - Product card typography
   - Form elements
   - Button text

3. **Low Priority** (Polish)
   - Stats and accent text
   - Metadata displays

## Typography Guidelines

### Headings
- **H1**: `font-serif text-6xl md:text-7xl lg:text-8xl font-normal`
- **H2**: `font-serif text-4xl md:text-5xl font-normal`
- **H3**: `font-serif text-3xl md:text-4xl font-normal`
- **H4-H6**: `font-sans` with appropriate sizes

### Body Text
- **Default**: `font-sans text-base`
- **Large**: `font-sans text-lg`
- **Small**: `font-sans text-sm`

### Accent Text
- **Category labels**: `font-accent text-sm font-bold uppercase tracking-wider`
- **Stats**: `font-accent text-2xl font-bold`
- **Buttons**: `font-sans font-medium`

### Special Elements
- **Price displays**: `font-sans font-semibold`
- **Navigation links**: `font-sans font-medium`
- **Form labels**: `font-sans text-sm font-medium`

## Next Steps

1. Update Navigation component to use proper font families
2. Update Footer component typography
3. Ensure all product cards use consistent typography
4. Review and update any remaining components
5. Create a Typography component library for consistency