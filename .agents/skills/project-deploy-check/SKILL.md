---
name: project-deploy-check
description: Use for deployment readiness checks, release checks, production build validation, environment-variable review, or pre-launch QA for The Good Opal Co.
---

# Deployment Readiness Workflow

Check deployment risk without making unrelated product changes.

## Checklist

1. Run `pnpm validate:build`.
2. Confirm required environment variables are documented and not hard-coded.
3. Review Stripe webhook configuration assumptions.
4. Confirm Payload/database requirements and migrations or generated types.
5. Check for debug logging, TODOs tied to deployment, or temporary flags.
6. Review SEO metadata, robots/sitemap behavior, analytics, and image handling if
   the task is launch-facing.
7. Summarize blockers with file references and exact commands needed to clear
   them.

## Verification

- Prefer evidence from commands and file references over broad confidence
  statements.
- If local services or credentials are unavailable, state exactly which checks
  were skipped and why.
