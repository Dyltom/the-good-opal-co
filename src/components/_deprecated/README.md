# Deprecated Components

This folder contains deprecated components that have been replaced with newer, more maintainable versions.

## Why These Components Were Deprecated

These components were deprecated as part of a code quality improvement initiative to:
- Eliminate code duplication
- Follow SOLID principles
- Improve maintainability
- Reduce bundle size

## Cart Components

### AnimatedAddToCartButton.tsx & AddToCartButtonPro.tsx
**Replaced by:** `/src/components/cart/AddToCartButton.tsx`
**Reason:** Multiple implementations of the same functionality violated DRY principles
**Migration:** The new unified component supports all features through props:
- `variant`: 'default' | 'icon' | 'minimal'
- `showConfetti`: boolean for confetti animation
- `animated`: boolean for motion animations
- `size`: 'sm' | 'md' | 'lg'

## Note

These files are kept for reference only and should not be imported in new code.