/**
 * Payload CMS Client Singleton
 *
 * Server-side only utility for accessing Payload's Local API.
 * Uses the singleton pattern to ensure consistent client instance.
 *
 * @example
 * const payload = await getPayload()
 * const products = await payload.find({ collection: 'products' })
 */

import { getPayload as getPayloadClient } from 'payload'
import config from '@payload-config'

/**
 * Get the Payload client instance
 * Uses the Local API for direct database queries without HTTP overhead.
 *
 * @returns Promise<Payload> - The Payload client instance
 */
export const getPayload = () => getPayloadClient({ config })
