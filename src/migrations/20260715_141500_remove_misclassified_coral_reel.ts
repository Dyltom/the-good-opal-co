import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const misclassifiedCoralReference = {
  assetPath: 'instagram://thegoodopalco/reel/CYyUqFlpb6O',
  notes:
    'Public collection reel dated 16 January 2022 includes the square clean-bezel ring alongside the sold jewellery range; the reel does not state dimensions.',
  observedAt: '2022-01-16T00:00:00.000Z',
  sourceType: 'instagram',
  sourceUrl: 'https://www.instagram.com/thegoodopalco/reel/CYyUqFlpb6O/',
  verificationLevel: 'route-available',
  verifiedAt: '2026-07-14T15:05:00.000Z',
  view: 'three-quarter',
} as const

/** Removes a collection reel whose visible frames do not prove Coral geometry. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(reference ORDER BY ordinal)
        FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
          WITH ORDINALITY AS existing(reference, ordinal)
        WHERE (reference ->> 'sourceUrl') IS DISTINCT FROM ${misclassifiedCoralReference.sourceUrl}::text
      ),
      '[]'::jsonb
    )
    WHERE design.style = 'coral'::enum_ring_designs_style
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
          AS existing(reference)
        WHERE reference ->> 'sourceUrl' = ${misclassifiedCoralReference.sourceUrl}::text
      );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE ring_designs AS design
    SET source_references = COALESCE(design.source_references, '[]'::jsonb)
      || jsonb_build_array(${JSON.stringify(misclassifiedCoralReference)}::jsonb)
    WHERE design.style = 'coral'::enum_ring_designs_style
      AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
          AS existing(reference)
        WHERE reference ->> 'sourceUrl' = ${misclassifiedCoralReference.sourceUrl}::text
      );
  `)
}
