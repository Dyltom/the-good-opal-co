export const wooImportModes = ['initial', 'final-delta'] as const

export type WooImportMode = (typeof wooImportModes)[number]

export interface WooImportRunConfiguration {
  runId: string
  mode: WooImportMode
  deploymentId?: string
}

interface WooImportRunClaimOperations<T> {
  create: () => Promise<T>
  findStatus: () => Promise<string | null>
}

const runIdPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{7,119}$/

export function parseWooImportRunConfiguration(
  environment: NodeJS.ProcessEnv,
  apply: boolean
): WooImportRunConfiguration | null {
  if (!apply) return null

  const runId = environment['WOO_IMPORT_RUN_ID']?.trim()
  if (!runId || !runIdPattern.test(runId)) {
    throw new Error(
      'WOO_IMPORT_RUN_ID must be a unique 8-120 character identifier using letters, numbers, dots, underscores, or hyphens'
    )
  }

  const mode = environment['WOO_IMPORT_MODE']?.trim()
  if (mode !== 'initial' && mode !== 'final-delta') {
    throw new Error('WOO_IMPORT_MODE must be initial or final-delta when applying an import')
  }

  const deploymentId = environment['VERCEL_DEPLOYMENT_ID']?.trim()
  return {
    runId,
    mode,
    ...(deploymentId ? { deploymentId } : {}),
  }
}

export async function claimWooImportRun<T>(
  configuration: WooImportRunConfiguration,
  operations: WooImportRunClaimOperations<T>
): Promise<T> {
  try {
    return await operations.create()
  } catch (error: unknown) {
    const previousStatus = await operations.findStatus()
    if (previousStatus) {
      throw new Error(
        `WooCommerce import run ${configuration.runId} was already claimed (${previousStatus}); use a new WOO_IMPORT_RUN_ID only after reviewing the ledger`
      )
    }
    throw error
  }
}
