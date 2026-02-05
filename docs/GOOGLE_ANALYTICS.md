# Google Analytics 4 Integration

This document describes the Google Analytics 4 (GA4) integration in The Good Opal Co e-commerce platform.

## Setup

### 1. Environment Variable

Add your GA4 Measurement ID to your `.env.local` file:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

You can find your Measurement ID in your Google Analytics 4 property settings.

### 2. Features

The integration automatically tracks the following e-commerce events:

#### Product Events
- **View Item** - When a user views a product detail page
- **Add to Cart** - When a user adds a product to their cart
- **Remove from Cart** - When a user removes a product from their cart

#### Checkout Events
- **Begin Checkout** - When a user starts the checkout process
- **Purchase** - When a user completes a purchase (triggered via webhook)

#### Other Events
- **Search** - When a user performs a search
- **View Search Results** - When search results are displayed
- **Newsletter Signup** - When a user subscribes to the newsletter
- **Share** - When a user shares content

### 3. Development Mode

In development mode (`NODE_ENV=development`), analytics events are logged to the console instead of being sent to Google Analytics. This helps with debugging without polluting your analytics data.

## Architecture

The analytics implementation follows SOLID principles:

### Service Layer (`/src/lib/analytics/service.ts`)
- **GoogleAnalyticsService** - Production implementation
- **MockAnalyticsService** - Development/testing implementation
- **Factory pattern** for creating the appropriate service

### Event Helpers (`/src/lib/analytics/events.ts`)
- Type-safe event tracking functions
- Automatic data formatting for GA4
- Currency handling (AUD)

### Components
- **GoogleAnalytics** (`/src/components/analytics/GoogleAnalytics.tsx`) - Script loader and page view tracking
- **ProductViewTracker** (`/src/components/analytics/ProductViewTracker.tsx`) - Automatic product view tracking

## Usage Examples

### Track a Custom Event

```typescript
import { getAnalyticsService } from '@/lib/analytics'

const analytics = getAnalyticsService()

analytics.trackEvent({
  eventName: 'custom_event',
  parameters: {
    category: 'engagement',
    action: 'click',
    label: 'header_cta'
  }
})
```

### Track Product View (Automatic)

Product views are automatically tracked when a user visits a product detail page. The `ProductViewTracker` component wraps the product content and sends the event on mount.

### Track Add to Cart (Automatic)

Add to cart events are automatically tracked when using the `AddToCartButton` component. The event includes product details and quantity.

### Track Newsletter Signup (Automatic)

Newsletter signups are tracked when a user confirms their email subscription.

## Testing

The analytics integration includes a mock service for testing:

```typescript
import { MockAnalyticsService } from '@/lib/analytics'

const mockAnalytics = new MockAnalyticsService()

// Track events
mockAnalytics.trackEvent({ eventName: 'test_event' })

// Verify tracked events
const events = mockAnalytics.getEvents()
console.log(events)

// Clear tracked events
mockAnalytics.clear()
```

## Privacy Compliance

- Analytics only loads in production environment
- Cookie consent is managed via the CookieConsent component
- No personally identifiable information (PII) is sent to GA4
- User email addresses are hashed before being sent as user IDs

## Debugging

To debug analytics in development:

1. Set `debug: true` when creating the analytics service
2. Open browser console to see all tracked events
3. Use the Google Analytics Debugger Chrome extension

## Future Enhancements

- Enhanced e-commerce tracking (product impressions, promotions)
- User properties and segments
- Custom dimensions and metrics
- Server-side tracking for sensitive events
- Conversion tracking optimization