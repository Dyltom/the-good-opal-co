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

## Product Components

### ProductCardPro.tsx, AnimatedProductCard.tsx & MagicalProductCard.tsx
**Replaced by:** `/src/components/product/ProductCard.tsx`
**Reason:** 4 different product card implementations (975 lines total) violated DRY principles
**Migration:** The new unified component supports all features through props:
- `variant`: 'default' | 'museum' | 'minimal'
- `showMetadata`: boolean for stone origin/type display
- `animated`: boolean for entrance animations
- `showWishlist`: boolean for wishlist functionality
- `darkBackground`: boolean for dark background support

### Key Features Preserved:
- Museum-style typography ("Acquisition Value", "In Private Collection")
- Smart badge logic (20%+ discounts, new arrivals)
- Framer Motion animations
- Shimmer effects
- Wishlist functionality

## Note

These files are kept for reference only and should not be imported in new code.