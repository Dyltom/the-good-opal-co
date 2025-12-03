# Deployment Readiness Check

Verify the app is ready for deployment:

1. Run full build: `pnpm build`
2. Check for TypeScript errors
3. Run all tests
4. Check environment variables are documented
5. Verify no console.logs or debug code
6. Check that all images are optimized
7. Verify meta tags and SEO
8. Check for any TODO comments that should be addressed
9. Review Stripe webhook configuration
10. Verify database migrations are up to date

Report any blockers and suggest fixes.
