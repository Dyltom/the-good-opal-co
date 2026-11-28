import config from '@payload-config'
import '@payloadcms/next/css'
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'
import { retryOnSerializationFailure } from '@/payload/retry-serialization'

export const GET = REST_GET(config)
export const POST = retryOnSerializationFailure(REST_POST(config))
export const DELETE = retryOnSerializationFailure(REST_DELETE(config))
export const PATCH = retryOnSerializationFailure(REST_PATCH(config))
export const PUT = retryOnSerializationFailure(REST_PUT(config))
export const OPTIONS = REST_OPTIONS(config)
