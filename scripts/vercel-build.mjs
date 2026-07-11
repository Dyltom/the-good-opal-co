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
  run('pnpm', ['payload', 'migrate'])
  if (vercelEnvironment === 'production' && process.env.WOO_IMPORT_ON_DEPLOY === 'true') {
    console.log('[vercel-build] Running one-time WooCommerce commerce import.')
    run('pnpm', ['import:woocommerce'], {
      ...process.env,
      WOO_IMPORT_APPLY: 'true',
    })
  }
} else {
  console.log('[vercel-build] Skipping database migrations outside Vercel deployments.')
}

run('pnpm', ['build'])
