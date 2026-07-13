import { spawnSync } from 'node:child_process'

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    env,
    stdio: 'inherit',
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run('pnpm', ['payload', 'generate:importmap'])

const vercelEnvironment = process.env.VERCEL_ENV

if (vercelEnvironment === 'production' || vercelEnvironment === 'preview') {
  if (vercelEnvironment === 'production') {
    run('node', ['scripts/reconcile-production-migration-ledger.mjs'])
  }
  run('pnpm', ['payload', 'migrate'])
  if (vercelEnvironment === 'production' && process.env.WOO_IMPORT_DRY_RUN_ON_DEPLOY === 'true') {
    console.log('[vercel-build] Running read-only WooCommerce import reconciliation.')
    run('pnpm', ['import:woocommerce'], {
      ...process.env,
      WOO_IMPORT_APPLY: 'false',
    })
    run('pnpm', ['import:wordpress-product-images'], {
      ...process.env,
      WORDPRESS_PRODUCT_IMAGES_APPLY: 'false',
    })
  }
  if (vercelEnvironment === 'production' && process.env.WOO_IMPORT_ON_DEPLOY === 'true') {
    if (!process.env.WOO_IMPORT_RUN_ID?.trim()) {
      throw new Error('[vercel-build] WOO_IMPORT_RUN_ID is required for a production import.')
    }
    if (!['initial', 'final-delta'].includes(process.env.WOO_IMPORT_MODE)) {
      throw new Error('[vercel-build] WOO_IMPORT_MODE must be initial or final-delta.')
    }
    console.log(
      `[vercel-build] Running guarded WooCommerce ${process.env.WOO_IMPORT_MODE} import ${process.env.WOO_IMPORT_RUN_ID}.`
    )
    run('pnpm', ['import:woocommerce'], {
      ...process.env,
      WOO_IMPORT_APPLY: 'true',
    })
    console.log('[vercel-build] Reconciling ordered WooCommerce product photography.')
    run('pnpm', ['import:wordpress-product-images'], {
      ...process.env,
      WORDPRESS_PRODUCT_IMAGES_APPLY: 'true',
    })
  }
} else {
  console.log('[vercel-build] Skipping database migrations outside Vercel deployments.')
}

run('pnpm', ['build'])
