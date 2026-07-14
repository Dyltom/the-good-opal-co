import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { describe, expect, test, vi } from 'vitest'
import { ringDesignSourceReferenceSchema } from '../../lib/custom-builder/ring-design-reference'
import {
  down,
  instagramContentReview,
  up,
} from '../20260715_042500_instagram_content_review'

describe('Instagram content review migration', () => {
  test('promotes only the four posts reviewed in an authenticated browser', () => {
    expect(instagramContentReview.reviewedUrls).toHaveLength(4)
    expect(new Set(instagramContentReview.reviewedUrls)).toHaveLength(4)

    for (const sourceUrl of instagramContentReview.reviewedUrls) {
      expect(
        ringDesignSourceReferenceSchema.safeParse({
          accountHandle: '@thegoodopalco',
          assetPath: `instagram://${new URL(sourceUrl).pathname.slice(1)}`,
          sourceType: 'instagram',
          sourceUrl,
          verificationLevel: instagramContentReview.verificationLevel,
          verifiedAt: instagramContentReview.reviewedAt,
          view: 'top',
        }).success
      ).toBe(true)
    }
  })

  test('executes one atomic statement in each direction', async () => {
    const upExecute = vi.fn().mockResolvedValue(undefined)
    const downExecute = vi.fn().mockResolvedValue(undefined)

    await up({ db: { execute: upExecute } } as unknown as MigrateUpArgs)
    await down({ db: { execute: downExecute } } as unknown as MigrateDownArgs)

    expect(upExecute).toHaveBeenCalledTimes(1)
    expect(downExecute).toHaveBeenCalledTimes(1)
  })
})
