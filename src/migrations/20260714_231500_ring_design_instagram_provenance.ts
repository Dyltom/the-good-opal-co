import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

type RingDesignStyle = 'aurora' | 'coral' | 'gemini' | 'sun-moon'
type RingReferenceView = 'three-quarter' | 'top'

export interface InstagramRingDesignReference {
  assetPath: string
  notes: string
  observedAt: string
  sourceType: 'instagram'
  sourceUrl: string
  view: RingReferenceView
}

export function mergeInstagramReferences(
  existing: readonly InstagramRingDesignReference[],
  additions: readonly InstagramRingDesignReference[]
): InstagramRingDesignReference[] {
  const merged = [...existing]
  const sourceUrls = new Set(existing.map(({ sourceUrl }) => sourceUrl))

  for (const reference of additions) {
    if (sourceUrls.has(reference.sourceUrl)) continue
    merged.push(reference)
    sourceUrls.add(reference.sourceUrl)
  }

  return merged
}

const rawInstagramReferences = {
  aurora: [
    {
      assetPath: 'instagram://thegoodopalco/p/CXLcsdBvc2Y',
      notes:
        'Public post dated 7 December 2021 explicitly names the Aurora ring and shows its pear bezel with a tight handmade grain halo.',
      observedAt: '2021-12-07T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CXLcsdBvc2Y/',
      view: 'three-quarter',
    },
    {
      assetPath: 'instagram://thegoodopalco/p/CXnomebPrtC',
      notes:
        'Public post dated 18 December 2021 shows the pear face, bezel lip, close-packed irregular grains, and shoulder junctions.',
      observedAt: '2021-12-18T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CXnomebPrtC/',
      view: 'top',
    },
  ],
  coral: [
    {
      assetPath: 'instagram://thegoodopalco/p/CW5do3uPVXY',
      notes:
        'Public post dated 30 November 2021 shows the sold square cushion full-bezel construction and its low single shank.',
      observedAt: '2021-11-30T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CW5do3uPVXY/',
      view: 'top',
    },
    {
      assetPath: 'instagram://thegoodopalco/reel/CYyUqFlpb6O',
      notes:
        'Public collection reel dated 16 January 2022 includes the square clean-bezel ring alongside the sold jewellery range; the reel does not state dimensions.',
      observedAt: '2022-01-16T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/reel/CYyUqFlpb6O/',
      view: 'three-quarter',
    },
  ],
  gemini: [
    {
      assetPath: 'instagram://thegoodopalco/p/CXdU2-NPh8e',
      notes:
        'Public post dated 14 December 2021 shows a simple oval full bezel, narrow forged shank, and direct shoulder junctions.',
      observedAt: '2021-12-14T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CXdU2-NPh8e/',
      view: 'three-quarter',
    },
    {
      assetPath: 'instagram://thegoodopalco/p/CXs9vfuP-DZ',
      notes:
        'Public post dated 20 December 2021 shows the clean oval bezel face and single forged shank without a grain halo.',
      observedAt: '2021-12-20T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CXs9vfuP-DZ/',
      view: 'top',
    },
  ],
  'sun-moon': [
    {
      assetPath: 'instagram://thegoodopalco/p/CW-k_nUPodQ',
      notes:
        'Public sold-ring post dated 2 December 2021 shows the oval bezel and close-packed rounded grain halo.',
      observedAt: '2021-12-02T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CW-k_nUPodQ/',
      view: 'top',
    },
    {
      assetPath: 'instagram://thegoodopalco/p/CXDr4NfP8KR',
      notes:
        'Public close-up dated 4 December 2021 shows individual rounded grains fused into a continuous solder web around the oval bezel.',
      observedAt: '2021-12-04T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CXDr4NfP8KR/',
      view: 'top',
    },
    {
      assetPath: 'instagram://thegoodopalco/p/CXVzSq6vPS-',
      notes:
        'Public worn-ring post dated 11 December 2021 shows the tight oval grain halo, low shoulders, and single shank.',
      observedAt: '2021-12-11T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/thegoodopalco/p/CXVzSq6vPS-/',
      view: 'three-quarter',
    },
    {
      assetPath: 'instagram://goodopalco/reel/DDRWMlQyOtA',
      notes:
        'Public sold-ring reel dated 7 December 2024 shows the continuing oval bezel and tight small-grain halo construction; the reel does not state the style name or dimensions.',
      observedAt: '2024-12-07T00:00:00.000Z',
      sourceType: 'instagram',
      sourceUrl: 'https://www.instagram.com/goodopalco/reel/DDRWMlQyOtA/',
      view: 'top',
    },
  ],
} as const satisfies Record<RingDesignStyle, readonly InstagramRingDesignReference[]>

export const ringDesignInstagramReferences = {
  aurora: mergeInstagramReferences([], rawInstagramReferences.aurora),
  coral: mergeInstagramReferences([], rawInstagramReferences.coral),
  gemini: mergeInstagramReferences([], rawInstagramReferences.gemini),
  'sun-moon': mergeInstagramReferences([], rawInstagramReferences['sun-moon']),
} as const satisfies Record<RingDesignStyle, readonly InstagramRingDesignReference[]>

export const instagramReferenceUrls = Object.values(ringDesignInstagramReferences).flatMap(
  (references) => references.map(({ sourceUrl }) => sourceUrl)
)

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    WITH evidence(style, references) AS (
      VALUES
        ('gemini'::enum_ring_designs_style, ${JSON.stringify(ringDesignInstagramReferences.gemini)}::jsonb),
        ('coral'::enum_ring_designs_style, ${JSON.stringify(ringDesignInstagramReferences.coral)}::jsonb),
        ('sun-moon'::enum_ring_designs_style, ${JSON.stringify(ringDesignInstagramReferences['sun-moon'])}::jsonb),
        ('aurora'::enum_ring_designs_style, ${JSON.stringify(ringDesignInstagramReferences.aurora)}::jsonb)
    )
    UPDATE ring_designs AS design
    SET source_references = COALESCE(design.source_references, '[]'::jsonb) || COALESCE(
      (
        SELECT jsonb_agg(candidate.reference)
        FROM jsonb_array_elements(evidence.references) AS candidate(reference)
        WHERE NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
            AS existing(reference)
          WHERE existing.reference ->> 'sourceUrl' = candidate.reference ->> 'sourceUrl'
        )
      ),
      '[]'::jsonb
    )
    FROM evidence
    WHERE design.style = evidence.style;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    WITH removed(source_url) AS (
      VALUES
        ('https://www.instagram.com/thegoodopalco/p/CXdU2-NPh8e/'),
        ('https://www.instagram.com/thegoodopalco/p/CXs9vfuP-DZ/'),
        ('https://www.instagram.com/thegoodopalco/p/CW5do3uPVXY/'),
        ('https://www.instagram.com/thegoodopalco/reel/CYyUqFlpb6O/'),
        ('https://www.instagram.com/thegoodopalco/p/CW-k_nUPodQ/'),
        ('https://www.instagram.com/thegoodopalco/p/CXDr4NfP8KR/'),
        ('https://www.instagram.com/thegoodopalco/p/CXVzSq6vPS-/'),
        ('https://www.instagram.com/goodopalco/reel/DDRWMlQyOtA/'),
        ('https://www.instagram.com/thegoodopalco/p/CXLcsdBvc2Y/'),
        ('https://www.instagram.com/thegoodopalco/p/CXnomebPrtC/')
    )
    UPDATE ring_designs AS design
    SET source_references = COALESCE(
      (
        SELECT jsonb_agg(existing.reference)
        FROM jsonb_array_elements(COALESCE(design.source_references, '[]'::jsonb))
          AS existing(reference)
        WHERE NOT EXISTS (
          SELECT 1
          FROM removed
          WHERE removed.source_url = existing.reference ->> 'sourceUrl'
        )
      ),
      '[]'::jsonb
    )
    WHERE design.style IN ('gemini', 'coral', 'sun-moon', 'aurora');
  `)
}
