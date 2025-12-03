# Store Feature Development

Implement a store/e-commerce feature: $ARGUMENTS

Follow project patterns:
1. Use Server Components by default
2. Use Server Actions for mutations (not API routes)
3. Use cookie-based cart (see src/lib/cart.ts)
4. Follow SOLID principles
5. Use Zod for validation
6. Use Payload CMS for data (getPayload())
7. Prices in cents, use formatPrice() for display

Steps:
1. Analyze the feature requirements
2. Identify affected files and components
3. Create/update Payload collections if needed
4. Implement server components and actions
5. Add client interactivity only where necessary
6. Test the feature manually
7. Commit with conventional commit message
