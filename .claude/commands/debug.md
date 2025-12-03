# Debug Issue

Systematically debug the reported issue:

## Process
1. **Understand** - Read relevant code and error messages
2. **Reproduce** - Identify steps to reproduce the issue
3. **Isolate** - Narrow down the root cause
4. **Fix** - Implement minimal targeted fix
5. **Verify** - Ensure fix works and doesn't break other functionality

## Investigation Steps
- Check console errors and network requests
- Review recent changes to affected files
- Trace data flow from source to symptom
- Check for type mismatches or null values

## Common Issues in This Codebase
- Cart cookie serialization issues
- Stripe webhook signature verification
- Server/client component boundary errors
- Payload CMS query errors
- Hydration mismatches (client state vs server)

## Fix Requirements
- Target root cause, not symptoms
- Keep changes minimal and focused
- Add error handling if missing
- Update tests to cover the bug case

What issue should I debug?
