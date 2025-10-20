# Testing Guide

Comprehensive testing strategy for Rapid Sites.

## Test Coverage

### ✅ Unit Tests (Vitest)
- **95 tests passing**
- **Coverage**: All utility functions
- **Location**: `src/__tests__/`

**What's tested:**
- `lib/utils.ts` - 33 tests (formatters, slugify, etc.)
- `lib/validation.ts` - 32 tests (validators)
- `lib/tenant.ts` - 17 tests (multi-tenancy)
- `lib/db.ts` - 9 tests (database helpers)
- `lib/theme.ts` - 4 tests (theming)

### ✅ E2E Tests (Playwright)
- **10 tests passing**
- **Coverage**: Critical user flows
- **Location**: `e2e/`

**What's tested:**
- Homepage loads and renders correctly
- Navigation works (desktop + mobile)
- Features section displays
- Contact form renders
- Blog listing page
- Demo/PageBuilder page
- Responsive design

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm test run

# Watch mode
pnpm test:watch

# With UI
pnpm test:ui

# Coverage report
pnpm test:coverage
```

### E2E Tests
```bash
# Run E2E tests (headless)
pnpm test:e2e

# With UI (interactive)
pnpm test:e2e:ui

# Headed mode (see browser)
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# View last test report
pnpm exec playwright show-report
```

### Full Validation
```bash
# Run ALL checks (TypeScript + ESLint + Unit tests)
pnpm validate

# Run EVERYTHING (includes E2E)
pnpm validate:all
```

## Pre-Deployment Checklist

**MUST pass before deploying:**

1. ✅ `pnpm validate:all` - All tests passing
2. ✅ `docker build -t test .` - Docker build successful
3. ✅ Manual browser testing of new features
4. ✅ Check `/api/health` responds
5. ✅ Verify forms submit correctly
6. ✅ Test responsive design (mobile/tablet/desktop)
7. ✅ Test all new integrations work

## Test Types

### Unit Tests
- **Purpose**: Test individual functions in isolation
- **Speed**: Fast (< 1s)
- **When**: Test all utilities, helpers, validators
- **Framework**: Vitest + Testing Library

### E2E Tests
- **Purpose**: Test real user flows in browser
- **Speed**: Slower (~8s for 10 tests)
- **When**: Test critical paths, navigation, forms
- **Framework**: Playwright

### Component Tests
- **Purpose**: Test React components
- **Speed**: Medium
- **When**: Test complex interactive components
- **Framework**: Vitest + Testing Library React

## Writing Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest'
import { slugify } from '@/lib/utils'

describe('slugify', () => {
  it('should create valid slugs', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Rapid Sites/)
})
```

## Current Test Results

### Unit Tests: ✅ 95/95 passing
```
✓ lib/utils.test.ts (33 tests)
✓ lib/validation.test.ts (32 tests)
✓ lib/tenant.test.ts (17 tests)
✓ lib/db.test.ts (9 tests)
✓ lib/theme.test.ts (4 tests)
```

### E2E Tests: ✅ 10/10 passing
```
✓ Homepage loads successfully
✓ Navigation works
✓ Features display correctly
✓ Responsive navigation (mobile menu)
✓ Contact form renders
✓ Demo page loads
✓ Stats section displays
✓ Features grid shows
✓ Blog listing page
✓ Blog navigation
```

## Testing Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **One assertion per test (when possible)**
4. **Arrange, Act, Assert pattern**
5. **Mock external dependencies**
6. **Test edge cases**
7. **Keep tests fast and isolated**

## CI/CD Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Every push (GitHub Actions - when configured)
- Before deployment (required)

## Debugging Failed Tests

### Unit Tests
```bash
# Run specific test file
pnpm test src/__tests__/lib/utils.test.ts

# Debug mode
pnpm test:ui
```

### E2E Tests
```bash
# Run specific test
pnpm test:e2e e2e/homepage.spec.ts

# Debug with browser visible
pnpm test:e2e:headed

# Step through with debugger
pnpm test:e2e:debug

# View HTML report
pnpm exec playwright show-report
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities
- **E2E Tests**: All critical user paths
- **Component Tests**: Complex interactive components
- **Integration Tests**: API routes (when database connected)

## Known Limitations

- E2E tests run without database (test empty states)
- Payload admin tests require DB connection
- Payment/email tests require API keys (use mocks)

## Next Steps

- [ ] Add component tests for UI components
- [ ] Add API integration tests
- [ ] Add visual regression tests (optional)
- [ ] Set up CI/CD pipeline
- [ ] Add performance tests

---

**Current Status**: ✅ FULLY TESTED
- Unit Tests: 95/95 passing
- E2E Tests: 10/10 passing
- Total: **105/105 tests passing** 🎉
