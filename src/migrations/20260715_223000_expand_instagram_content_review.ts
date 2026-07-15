import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const expandedInstagramContentReview = {
  reviewedAt: '2026-07-15T11:55:00.000Z',
  reviewedUrls: [
    'https://www.instagram.com/thegoodopalco/p/CXLcsdBvc2Y/',
    'https://www.instagram.com/thegoodopalco/p/CXdU2-NPh8e/',
    'https://www.instagram.com/thegoodopalco/p/CW-k_nUPodQ/',
    'https://www.instagram.com/thegoodopalco/p/CXDr4NfP8KR/',
  ],
  verificationLevel: 'content-reviewed',
} as const

export const routeOnlySoldReel = {
  sourceUrl: 'https://www.instagram.com/goodopalco/reel/DDRWMlQyOtA/',
  previousNotes:
    'Public sold-ring reel dated 7 December 2024 shows the continuing oval bezel and tight small-grain halo construction; the reel does not state the style name or dimensions.',
  reviewedNotes:
    'Public reel dated 7 December 2024 says the ring sold. The initial reviewed frame shows the maker, not enough ring geometry to support model-fidelity claims; keep route-only until every reel frame is reviewed.',
} as const

/**
 * Promotes only posts whose visible account, caption, date, and ring imagery
 * were reviewed. The sold reel remains route-only because its inspected frame
 * does not establish geometry.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    WITH reviewed(source_url) AS (
      SELECT jsonb_array_elements_text(${JSON.stringify(expandedInstagramContentReview.reviewedUrls)}::jsonb)
    )
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(
          CASE
            WHEN EXISTS (
              SELECT 1 FROM reviewed
              WHERE reviewed.source_url = reference ->> 'sourceUrl'
            )
            THEN reference || jsonb_build_object(
              'verificationLevel', ${expandedInstagramContentReview.verificationLevel}::text,
              'verifiedAt', ${expandedInstagramContentReview.reviewedAt}::text
            )
            WHEN reference ->> 'sourceUrl' = ${routeOnlySoldReel.sourceUrl}::text
            THEN reference || jsonb_build_object(
              'notes', ${routeOnlySoldReel.reviewedNotes}::text,
              'verificationLevel', 'route-available'
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
      WHERE reference ->> 'sourceUrl' IN (
        SELECT reviewed.source_url FROM reviewed
      ) OR reference ->> 'sourceUrl' = ${routeOnlySoldReel.sourceUrl}::text
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    WITH reviewed(source_url) AS (
      SELECT jsonb_array_elements_text(${JSON.stringify(expandedInstagramContentReview.reviewedUrls)}::jsonb)
    )
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(
          CASE
            WHEN EXISTS (
              SELECT 1 FROM reviewed
              WHERE reviewed.source_url = reference ->> 'sourceUrl'
            )
            THEN reference || jsonb_build_object(
              'verificationLevel', 'route-available',
              'verifiedAt', '2026-07-14T15:05:00.000Z'
            )
            WHEN reference ->> 'sourceUrl' = ${routeOnlySoldReel.sourceUrl}::text
            THEN reference || jsonb_build_object('notes', ${routeOnlySoldReel.previousNotes}::text)
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
      WHERE reference ->> 'sourceUrl' IN (
        SELECT reviewed.source_url FROM reviewed
      ) OR reference ->> 'sourceUrl' = ${routeOnlySoldReel.sourceUrl}::text
    );
  `)
}
