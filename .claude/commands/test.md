# Create Tests

Create tests for the specified code following project conventions:

## Test Types
- **Unit tests** (Vitest): For utilities, hooks, and pure functions
- **E2E tests** (Playwright): For user flows and integrations

## Unit Test Template
```typescript
import { describe, it, expect, vi } from 'vitest'

describe('functionName', () => {
  it('should handle expected case', () => {
    // Arrange
    // Act
    // Assert
  })

  it('should handle edge case', () => {
    // ...
  })
})
```

## E2E Test Template
```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('user can complete action', async ({ page }) => {
    await page.goto('/path')
    // Interactions
    // Assertions
  })
})
```

## Requirements
- Test behavior, not implementation
- Cover happy path and edge cases
- Use meaningful test descriptions
- Mock external dependencies (Stripe, Payload, etc.)

What code should I create tests for?
