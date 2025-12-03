# Create Server Action

Create a server action following Next.js 15 and project conventions:

## Template
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getPayload } from '@/lib/payload'

// Define input schema
const actionSchema = z.object({
  // fields
})

type ActionInput = z.infer<typeof actionSchema>

export async function actionName(input: ActionInput) {
  // 1. Validate input
  const validated = actionSchema.safeParse(input)
  if (!validated.success) {
    return { success: false, error: 'Invalid input' }
  }

  try {
    // 2. Perform operation
    const payload = await getPayload()

    // 3. Revalidate affected paths
    revalidatePath('/affected-path')

    return { success: true, data: result }
  } catch (error) {
    console.error('Action failed:', error)
    return { success: false, error: 'Operation failed' }
  }
}
```

## Requirements
- Always use `'use server'` directive
- Validate all inputs with Zod
- Return typed response objects
- Use `revalidatePath()` for cache invalidation
- Handle errors gracefully
- Log errors for debugging

What server action should I create?
