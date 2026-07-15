import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { describe, expect, test, vi } from 'vitest'
import { ringDesignSourceReferenceSchema } from '../../lib/custom-builder/ring-design-reference'
import {
  down,
  expandedInstagramContentReview,
  routeOnlySoldReel,
  up,
} from '../20260715_223000_expand_instagram_content_review'

describe('expanded Instagram content review migration', () => {
  test('promotes the four newly reviewed geometry posts', () => {
    expect(expandedInstagramContentReview.reviewedUrls).toHaveLength(4)
    expect(new Set(expandedInstagramContentReview.reviewedUrls)).toHaveLength(4)

    for (const sourceUrl of expandedInstagramContentReview.reviewedUrls) {
      expect(
        ringDesignSourceReferenceSchema.safeParse({
          accountHandle: '@thegoodopalco',
          assetPath: `instagram://${new URL(sourceUrl).pathname.slice(1, -1)}`,
          sourceType: 'instagram',
          sourceUrl,
          verificationLevel: expandedInstagramContentReview.verificationLevel,
          verifiedAt: expandedInstagramContentReview.reviewedAt,
          view: 'top',
        }).success
      ).toBe(true)
    }
  })

  test('keeps the sold reel route-only until its ring frames are reviewed', () => {
    expect(expandedInstagramContentReview.reviewedUrls).not.toContain(routeOnlySoldReel.sourceUrl)
    expect(routeOnlySoldReel.reviewedNotes).toContain('not enough ring geometry')
    expect(routeOnlySoldReel.reviewedNotes).toContain('route-only')
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
