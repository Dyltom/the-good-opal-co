import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { sql } from '@payloadcms/db-postgres'

const courseSlug = 'complete-opal-cutting-valuation-course'

const syllabus = [
  {
    id: 'course-introduction',
    topics: `## Welcome to the course
Introduction to the course
A little bit about me (Steph)
Why this course was created`,
  },
  {
    id: 'opal-anatomy',
    topics: `## M1 Lesson 1: Understanding opal anatomy
The basics: colour bars and potch
Host rock and residual material
Tips for inspecting opals
## M1 Lesson 2: Types of opal
Crystal opal
White opal
Black opal
Boulder opal
Matrix opal (Andamooka)
## M1 Lesson 3: Region of origin
Coober Pedy
Lightning Ridge
Mintabie
Andamooka
Winton and Opalton
Quilpie and Yowah
## M1 Lesson 4: Opals of the world
Mexican opals compared with Australian opals
Ethiopian opals compared with Australian opals
## Module 1: Review and reflection
Test time
Module 1 quiz`,
  },
  {
    id: 'sandpaper-method',
    topics: `## M2 Lesson 1: Introduction to the sandpaper method
Equipment
Inspection and planning
## M2 Lesson 2: Wet sanding, part 1
Sanding with 600 grit
## M2 Lesson 3: Wet sanding, part 2
Sanding with 1200 grit
## M2 Lesson 4: Polishing opal
Polish
## Module 2: Review and reflection
Tips and tricks
Assignment`,
  },
  {
    id: 'dremel-method',
    topics: `## M3 Lesson 1: Introduction to rotary-tool opal cutting
Overview of the opal-cutting process
Introduction to the rotary tool and resin tips
Importance of safety and proper handling
## M3 Lesson 2: Basics of cutting opals
Understanding the softness of opals
Equipment
Safety
## M3 Lesson 3: Rotary-tool cutting process
Technique and patience
Creating the rough shape and preparing a backing
## M3 Lesson 4: Opal refinement
Applying the opal to a dopstick
Refining the opal to pre-polish
## M3 Lesson 5: Polish
Pre-polishing
Getting a glossy finish
## Module 3: Review and reflection
Tips and tricks
Assignment`,
  },
  {
    id: 'cabbing-method',
    topics: `## M4 Lesson 1: Introduction to cabbing
Overview of the cabbing process
Inspecting opal refresher
## M4 Lesson 2: Understanding rough opal
Potch, host rock, and colour bar
Cutting for carat weight
## M4 Lesson 3: Understand your equipment
How the machine works
Safety first
Your new best friend
## M4 Lesson 4: Cutting techniques
Hard wheels
Soft wheels
Applying a dopstick refresher
Basic shaping: ovals and rounds
## M4 Lesson 5: Advanced shaping techniques
Calibrating opal
Cushion cuts
Marquise cuts
Freeform design
## M4 Lesson 6: Polish
Glass-finish polishing techniques
## Module 4: Review and reflection
Tips and tricks
Assignment`,
  },
  {
    id: 'opal-valuation',
    topics: `## M5 Lesson 1: Overview of the opal market
Opal rarity
Module structure overview
## M5 Lesson 2: Factors that determine price
Darkness and brightness
Colour
Patterns
Weight in carats
Inclusions
## M5 Lesson 3: How to price an opal
Darkness and brightness scale
Play of colour
Pattern rarity
Price per carat and overall cut
Inclusions
Pricing guide
Multipliers and detractors
## M5 Lesson 4: Opal valuation case studies
Case study: crystal opal
Case study: boulder opal
Case study: white opal
Case study: semi-black opal
Case study: black crystal opal
## M5 Lesson 5: Test your knowledge
Crystal opal valuation exercise
Boulder opal valuation exercise
Black opal valuation exercise
## Module 5: Review and reflection
Module 5 recap
Module 5 quiz`,
  },
  {
    id: 'final-review',
    topics: `## Module recaps
Module 1 recap
Module 2 recap
Module 3 recap
Module 4 recap
Module 5 recap
## Final assessment
Final quiz`,
  },
] as const

const previousTopics = [
  {
    id: 'course-introduction',
    topics: 'Introduction to the course\nAbout Steph\nWhy the course was created',
  },
  {
    id: 'opal-anatomy',
    topics:
      'Colour bars and potch\nHost rock and residual material\nInspecting opals\nCrystal, white, black, boulder, and matrix opal\nAustralian opal regions\nMexican and Ethiopian opal comparisons\nReview and quiz',
  },
  {
    id: 'sandpaper-method',
    topics:
      'Equipment and planning\nWet sanding with 600 grit\nWet sanding with 1200 grit\nPolishing\nTips and assignment',
  },
  {
    id: 'dremel-method',
    topics:
      'Process overview\nRotary tool and resin tips\nSafety and handling\nRough shaping and backing\nDopstick and refinement\nPre-polish and glossy finish\nTips and assignment',
  },
  {
    id: 'cabbing-method',
    topics:
      'Cabbing process and inspection\nPotch, host rock, and colour bar\nCutting for carat weight\nMachine operation and safety\nHard and soft wheels\nDopstick technique\nOval, round, cushion, marquise, and freeform shapes\nGlass-finish polish\nTips and assignment',
  },
  {
    id: 'opal-valuation',
    topics:
      'Market and rarity\nBody tone and brightness\nColour and pattern\nWeight and inclusions\nPlay of colour\nPrice per carat and overall cut\nMultipliers and detractors\nCase studies and test valuations\nReview and quiz',
  },
  {
    id: 'final-review',
    topics: 'Module recaps\nFinal quiz',
  },
] as const

async function updateSyllabus(
  db: MigrateUpArgs['db'] | MigrateDownArgs['db'],
  values: ReadonlyArray<{ id: string; topics: string }>
): Promise<void> {
  for (const entry of values) {
    await db.execute(sql`
      UPDATE "courses_curriculum"
      SET "topics" = ${entry.topics}
      WHERE "id" = ${entry.id}
        AND "_parent_id" = (SELECT "id" FROM "courses" WHERE "slug" = ${courseSlug});
    `)
  }

  await db.execute(sql`
    UPDATE "courses"
    SET "updated_at" = now()
    WHERE "slug" = ${courseSlug};
  `)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await updateSyllabus(db, syllabus)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await updateSyllabus(db, previousTopics)
}
