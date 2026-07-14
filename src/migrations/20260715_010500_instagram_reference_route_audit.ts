import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

export const instagramReferenceRouteAudit = {
  verificationLevel: 'route-available',
  verifiedAt: '2026-07-14T15:05:00.000Z',
} as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(
          CASE
            WHEN reference ->> 'sourceType' = 'instagram'
              AND reference ? 'sourceUrl'
            THEN reference || jsonb_build_object(
              'accountHandle', '@' || split_part(
                split_part(reference ->> 'sourceUrl', 'instagram.com/', 2),
                '/',
                1
              ),
              'verificationLevel', ${instagramReferenceRouteAudit.verificationLevel}::text,
              'verifiedAt', ${instagramReferenceRouteAudit.verifiedAt}::text
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
      WHERE existing.reference ->> 'sourceType' = 'instagram'
    );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(
          CASE
            WHEN reference ->> 'sourceType' = 'instagram'
            THEN reference - 'accountHandle' - 'verificationLevel' - 'verifiedAt'
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
      WHERE existing.reference ->> 'sourceType' = 'instagram'
    );
  `)
}
