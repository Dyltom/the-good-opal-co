import { spawnSync } from 'node:child_process'

function run(command, args) {
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run('pnpm', ['payload', 'generate:importmap'])

if (process.env.VERCEL_ENV === 'production') {
  run('pnpm', ['payload', 'migrate'])
} else {
  console.log('[vercel-build] Skipping database migrations outside Production.')
}

run('pnpm', ['build'])
