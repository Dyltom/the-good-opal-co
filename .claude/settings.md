# Rapid Sites - Claude Code Settings

## Project Context

This is a Next.js-based multi-tenant website framework for rapidly building and deploying small business websites. The project combines Next.js 15, Payload CMS 3.0, shadcn/ui, and TypeScript to create a production-ready platform for agencies serving small business clients.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **CMS**: Payload CMS 3.0 (native Next.js integration)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui, Magic UI, Aceternity UI
- **Animations**: Framer Motion
- **Deployment**: Docker, Coolify

## Code Style & Conventions

### General Guidelines (CRITICAL)

**Quality First, Always:**
- Test BEFORE claiming something works
- Be honest about what's tested vs what's not
- "It compiles" ≠ "It works"
- Manual verification required for new features

**TypeScript (Strict):**
- Use TypeScript for ALL code with strict type checking
- ZERO `any` usage (enforced)
- All types centralized in `src/types/`
- Import types from `@/types` only
- 100% type coverage required

**Architecture:**
- Follow Next.js 15 App Router conventions
- Use server components by default, client components only when needed
- DRY principles - no code duplication
- Single source of truth for everything
- Reusable components and utilities
- Prefer composition over inheritance
- Write self-documenting code with clear naming

### File Organization

```
src/
├── app/              # Next.js app directory
│   ├── (app)/       # Main site routes
│   ├── (admin)/     # Payload admin (automatic)
│   └── api/         # API routes
├── components/       # Shared components
│   ├── ui/          # shadcn/ui base components
│   ├── sections/    # Reusable page sections
│   └── templates/   # Full page templates
├── lib/             # Utilities and shared code
├── payload/         # Payload CMS configuration
│   ├── collections/ # Content collections
│   └── globals/     # Global settings
└── styles/          # Global styles
```

### Naming Conventions

- **Components**: PascalCase (`ButtonPrimary.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Types/Interfaces**: PascalCase with descriptive names (`UserProfile`, `SiteConfig`)
- **Files**: Use kebab-case for non-component files (`use-media-query.ts`)

### Component Structure

```tsx
// Imports
import { type ComponentProps } from 'react'

// Types
interface MyComponentProps {
  title: string
  description?: string
}

// Component
export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  )
}
```

### Payload Collections

- Each collection should have its own file in `src/payload/collections/`
- Use TypeScript for collection configs
- Include access control for multi-tenancy
- Add proper field validations

## Development Workflow

### Before Starting Work

1. Check ROADMAP.md for current priorities
2. Review related documentation
3. Ensure database is running (or use Docker: `pnpm docker:up`)
4. Run `pnpm dev` to start development server
5. Run `pnpm validate` to ensure clean starting point

### When Adding Features (STRICT PROCESS)

**NEVER skip testing. NEVER claim something works without verification.**

1. Create feature branch from `main`
2. Write code following DRY principles
3. **Add tests for new functionality** (REQUIRED - no exceptions)
4. **Run `pnpm validate`** - MUST pass (0 errors, 0 warnings)
5. **Test in browser** - REQUIRED manual verification
6. **Test integrations** - If API/DB/external service involved
7. **Test Docker if infrastructure changed** - Actual `docker build` test
8. Update relevant documentation
9. Update ROADMAP.md if completing a task
10. Commit with descriptive, detailed messages
11. **Only then** push to main

**Red Flags to Avoid:**
- ❌ "It should work" - TEST IT
- ❌ "Production ready" - Did you test it?
- ❌ "Code complete" - But does it run?
- ❌ Skipping browser testing
- ❌ Assuming integrations work
- ❌ Not testing error cases

### Commit Message Format

```
type(scope): brief description

- Detailed change 1
- Detailed change 2
```

Types: feat, fix, docs, style, refactor, test, chore

## Multi-Tenancy Architecture

### Key Principles

- All client data must be scoped to tenant
- Use tenant context for database queries
- Implement row-level security where possible
- Isolate media uploads per tenant
- Separate admin access by tenant

### Tenant Identification

- Subdomain-based: `client1.rapidsites.com`
- Custom domain support: `www.clientsite.com`
- Tenant ID stored in database and context

## Component Library Usage

### DRY Principles (CRITICAL)

**Before creating ANY component, ask:**
1. Does this already exist?
2. Can I reuse an existing component?
3. Can I make an existing component more generic?
4. Will this be used in multiple places? → Centralize it
5. Is this component-specific? → Keep it local

**Type Safety:**
- ALL components must have proper TypeScript props
- NO inline prop types - use interface
- Import shared types from `@/types`
- Local props are OK if truly component-specific

### shadcn/ui Components

- Copy components from shadcn/ui into `src/components/ui/`
- Customize as needed for project requirements
- Use CSS variables for theming
- Keep components accessible (ARIA labels, keyboard nav)
- **Add `name` attribute to all form inputs** (for testing + accessibility)

### Custom Components

- Build reusable sections in `src/components/sections/`
- Create full templates in `src/components/templates/`
- Use TypeScript for props interfaces
- Make components themeable via props or CSS variables
- **Test components** (unit or E2E)
- **Verify in browser** before committing

## Database & ORM

- Use Drizzle ORM for type-safe queries
- Define schemas in `src/lib/db/schema/`
- Use migrations for schema changes
- Include tenant_id in multi-tenant tables

## Deployment

### Docker

- Dockerfile included in `docker/`
- Multi-stage builds for production
- Environment variables via .env or secrets
- Health checks included

### Coolify

- Connect GitHub repository
- Set environment variables in dashboard
- Use Nixpacks or Dockerfile build method
- Enable auto-deploy on push to main

## Testing (MANDATORY - NO EXCEPTIONS)

### Golden Rule
**"Not tested = Not working"**

Do NOT say something is "ready" or "working" until you've:
1. Written automated tests
2. Run them and they pass
3. Manually verified in browser/environment
4. Tested error cases
5. Documented what was tested

### Testing Requirements (CRITICAL)

**BEFORE any deployment, merge, or claiming "it works":**

1. ✅ **Run `pnpm validate`** - MUST pass (type-check + lint + unit tests)
2. ✅ **Run `pnpm test:e2e`** - MUST pass (all E2E tests)
3. ✅ **Test Docker build**: `docker build -t rapid-sites:test .`
4. ✅ **Manual browser testing** - REQUIRED for ALL new features
5. ✅ **Test error cases** - What happens when things fail?
6. ✅ **Test integrations** - If using external APIs, test them
7. ✅ **Check health endpoint**: `curl http://localhost:3000/api/health`

**NEVER deploy, commit to main, or claim "production ready" without:**
- ✅ All TypeScript errors fixed (strict mode, zero `any`)
- ✅ Zero ESLint warnings/errors
- ✅ All tests passing (100% - currently 105/105)
- ✅ E2E tests passing (browser verification)
- ✅ Docker build successful
- ✅ Manual browser testing completed
- ✅ Error cases tested (404, errors, missing data)
- ✅ Forms actually submit (check network tab)
- ✅ Responsive design verified (mobile/tablet/desktop)

**Testing Levels (All Required):**

1. **Unit Tests** (Vitest)
   - Test all utilities, helpers, validators
   - Test business logic
   - Test pure functions
   - Aim for high coverage

2. **E2E Tests** (Playwright)
   - Test critical user paths
   - Test in real browser
   - Test responsive design
   - Test forms, navigation, interactions

3. **Manual Browser Testing**
   - Open every new page/component
   - Click every button
   - Submit every form
   - Check console for errors
   - Test on mobile viewport

4. **Integration Testing**
   - Test with real database
   - Test with real API keys
   - Test email actually sends
   - Test payments actually process
   - Test error responses

### Test Coverage (Minimum Requirements)

- ✅ Unit tests for utilities and helpers (REQUIRED)
- ✅ E2E tests for all user flows (REQUIRED)
- ✅ Browser testing for UI components (REQUIRED)
- ✅ Integration tests for API routes (REQUIRED when DB available)
- ✅ Error case testing (REQUIRED)
- ✅ Responsive testing (REQUIRED)

### Lessons Learned

**What went wrong initially:**
1. Said "Docker works" without testing Docker Compose
2. Said "production ready" before E2E tests
3. Didn't test forms - E2E found missing `name` attributes
4. Assumed code = working (it doesn't)

**What we do now:**
1. Test EVERYTHING before claiming it works
2. E2E tests catch real bugs
3. Manual verification required
4. Document what's tested vs what's not
5. Be honest about test coverage

## Performance

- Use Next.js Image for all images
- Implement proper caching strategies
- Lazy load components when appropriate
- Monitor bundle size
- Optimize database queries

## Security

- Validate all user inputs
- Sanitize content from CMS
- Use environment variables for secrets
- Implement rate limiting on APIs
- Regular dependency updates

## Documentation

- Keep README.md updated
- Document complex logic inline
- Update ROADMAP.md as tasks complete
- Add JSDoc comments for exported functions

## Common Tasks

### Adding a shadcn/ui Component

```bash
pnpm dlx shadcn@latest add [component-name]
```

### Creating a New Payload Collection

1. Create file in `src/payload/collections/`
2. Define collection config with TypeScript
3. Add to Payload config
4. Run migration if needed

### Adding a New Template

1. Create component in `src/components/templates/`
2. Add props interface
3. Use existing sections/components
4. Add to template registry

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Payload CMS Docs](https://payloadcms.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Support

For issues or questions:
- Check ROADMAP.md for known issues
- Review documentation in `docs/`
- Open GitHub issue for bugs or feature requests
