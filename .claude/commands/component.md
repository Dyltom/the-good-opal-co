# Create Component

Create a new component following project conventions:

## Requirements
- Use TypeScript with explicit prop types (never `any`)
- Follow Single Responsibility Principle
- Use `cn()` from `@/lib/utils` for conditional classes
- Export named (not default) from component file
- Place in appropriate directory under `src/components/`

## Structure Template
```typescript
import { cn } from '@/lib/utils'

interface ComponentNameProps {
  // Define focused, minimal props
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    // Implementation
  )
}
```

## Checklist
- [ ] Props interface defined and exported
- [ ] Component is composable (accepts className, children where appropriate)
- [ ] Uses existing UI primitives from `src/components/ui/`
- [ ] No business logic in UI components
- [ ] Accessibility attributes included

What component should I create?
