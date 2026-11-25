export const MARKETING_CONSENT_METADATA_KEY = 'marketing_consent'
export const MARKETING_CONSENT_AT_METADATA_KEY = 'marketing_consent_at'

export function hasMarketingConsent(metadata: Record<string, string> | null | undefined): boolean {
  return metadata?.[MARKETING_CONSENT_METADATA_KEY] === 'yes'
}
