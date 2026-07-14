import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const instagramContentReview = {
  reviewedAt: '2026-07-14T18:10:00.000Z',
  reviewedUrls: [
    'https://www.instagram.com/thegoodopalco/p/CXnomebPrtC/',
    'https://www.instagram.com/thegoodopalco/p/CW5do3uPVXY/',
    'https://www.instagram.com/thegoodopalco/p/CXs9vfuP-DZ/',
    'https://www.instagram.com/thegoodopalco/p/CXVzSq6vPS-/',
  ],
  verificationLevel: 'content-reviewed',
} as const

/**
 * Promotes only the posts whose visible account, post date, caption, and ring
 * imagery were reviewed in an authenticated browser. This does not imply
 * maker approval, calibrated dimensions, or ownership of the Instagram account.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    WITH reviewed(source_url) AS (
      SELECT jsonb_array_elements_text(${JSON.stringify(instagramContentReview.reviewedUrls)}::jsonb)
    )
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM reviewed
              WHERE reviewed.source_url = reference ->> 'sourceUrl'
            )
            THEN reference || jsonb_build_object(
              'verificationLevel', ${instagramContentReview.verificationLevel}::text,
              'verifiedAt', ${instagramContentReview.reviewedAt}::text
            )
            ELSE reference
          END
          ORDER BY ordinal
        )
        FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
          WITH ORDINALITY AS existing(reference, ordinal)
      ),
      '[]'::jsonb
    )
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
        AS existing(reference)
      JOIN reviewed ON reviewed.source_url = existing.reference ->> 'sourceUrl'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    WITH reviewed(source_url) AS (
      SELECT jsonb_array_elements_text(${JSON.stringify(instagramContentReview.reviewedUrls)}::jsonb)
    )
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(
          CASE
            WHEN EXISTS (
              SELECT 1
              FROM reviewed
              WHERE reviewed.source_url = reference ->> 'sourceUrl'
            )
            THEN reference || jsonb_build_object(
              'verificationLevel', 'route-available',
              'verifiedAt', '2026-07-14T15:05:00.000Z'
            )
            ELSE reference
          END
          ORDER BY ordinal
        )
        FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
          WITH ORDINALITY AS existing(reference, ordinal)
      ),
      '[]'::jsonb
    )
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
        AS existing(reference)
      JOIN reviewed ON reviewed.source_url = existing.reference ->> 'sourceUrl'
    );
  `)
}
