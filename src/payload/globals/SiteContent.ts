import type { Field, GlobalAfterChangeHook, GlobalConfig, Tab } from 'payload'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '../../lib/payload-access.ts'

export const SITE_CONTENT_PATHS = [
  '/',
  '/about',
  '/services',
  '/courses',
  '/faq',
  '/gifts',
  '/gift-vouchers',
  '/contact',
  '/blog',
  '/legal/terms',
  '/legal/privacy',
  '/legal/cookies',
  '/shipping',
  '/returns',
] as const

function heading(name: string, label: string): Field {
  return {
    name,
    label,
    type: 'group',
    admin: {
      description: 'Leave empty to keep the current wording. The second line is shown in italics.',
    },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'text', label: 'Words', type: 'text' },
          { name: 'italic', label: 'Words in italics', type: 'text' },
        ],
      },
    ],
  }
}

function paragraph(name: string, label: string): Field {
  return {
    name,
    label,
    type: 'textarea',
    admin: { description: 'Leave empty to keep the current wording.' },
  }
}

function picture(name: string, label: string): Field {
  return {
    name,
    label,
    type: 'group',
    admin: { description: 'Leave empty to keep the current photo.' },
    fields: [
      { name: 'image', label: 'Photo', type: 'upload', relationTo: 'media' },
      {
        name: 'alt',
        label: 'Photo description',
        type: 'text',
        admin: {
          description: 'For screen readers. Leave empty to use the photo’s own description.',
        },
      },
    ],
  }
}

function list(
  name: string,
  label: string,
  fields: { name: string; label: string; long?: boolean }[]
): Field {
  return {
    name,
    label,
    type: 'array',
    admin: { description: 'Leave empty to keep the current list.' },
    fields: fields.map(
      (field): Field =>
        field.long
          ? { name: field.name, label: field.label, type: 'textarea' }
          : { name: field.name, label: field.label, type: 'text' }
    ),
  }
}

function hero(): Field[] {
  return [heading('heroHeading', 'Top heading'), paragraph('heroText', 'Top text')]
}

function closing(): Field[] {
  return [
    heading('closingHeading', 'Closing band heading'),
    paragraph('closingText', 'Closing band text'),
    picture('closingImage', 'Closing band photo'),
  ]
}

function seo(): Field {
  return {
    name: 'seo',
    label: 'Search and sharing',
    type: 'group',
    admin: {
      description:
        'What Google and link previews show. Leave empty to keep the current title and description.',
    },
    fields: [
      { name: 'title', label: 'Page title', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  }
}

function policy(name: string, label: string): Tab {
  return {
    name,
    label,
    fields: [
      {
        name: 'heading',
        label: 'Heading',
        type: 'text',
        admin: { description: 'Leave empty to keep the current heading.' },
      },
      {
        name: 'lastUpdated',
        label: 'Last updated',
        type: 'date',
        admin: {
          date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMMM yyyy' },
          description: 'Leave empty to keep the current date.',
        },
      },
      {
        name: 'body',
        label: 'Page text',
        type: 'richText',
        admin: {
          description:
            'Leave empty to keep the current page. Once filled, this replaces the whole page text, so include every section.',
        },
      },
    ],
  }
}

const revalidatePages: GlobalAfterChangeHook = ({ req }) => {
  try {
    for (const page of SITE_CONTENT_PATHS) revalidatePath(page)
    revalidatePath('/courses/[slug]', 'page')
  } catch (error) {
    req.payload.logger.warn({
      msg: 'Page content saved outside Next; pages not revalidated',
      error,
    })
  }
}

export const SiteContent: GlobalConfig = {
  slug: 'site-content',
  label: 'Page content',
  access: {
    read: () => true,
    update: isAdmin,
  },
  admin: {
    description:
      'Text and photos on the main pages of the site. Empty fields keep the current wording or photo.',
  },
  versions: { max: 50 },
  hooks: { afterChange: [revalidatePages] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          name: 'home',
          label: 'Home',
          fields: [
            heading('collectionHeading', 'Collection heading'),
            picture('customImage', 'Design your own ring photo'),
            heading('customHeading', 'Design your own ring heading'),
            paragraph('customText', 'Design your own ring text'),
            { name: 'reviewsHeading', label: 'Reviews heading', type: 'text' },
            ...closing(),
            seo(),
          ],
        },
        {
          name: 'about',
          label: 'About',
          fields: [
            heading('heroHeading', 'Top heading'),
            paragraph('heroText', 'Top text'),
            picture('heroImage1', 'Top photo 1'),
            picture('heroImage2', 'Top photo 2'),
            picture('heroImage3', 'Top photo 3'),
            ...closing(),
            seo(),
          ],
        },
        {
          name: 'services',
          label: 'Services',
          fields: [
            heading('heroHeading', 'Top heading'),
            paragraph('heroText', 'Top text'),
            picture('heroImage', 'Top photo'),
            heading('processHeading', 'How it works heading'),
            ...closing(),
            seo(),
          ],
        },
        {
          name: 'courses',
          label: 'Courses',
          fields: [
            ...hero(),
            picture('heroImage1', 'Top photo 1'),
            picture('heroImage2', 'Top photo 2'),
            list('pillars', 'What the course covers', [
              { name: 'title', label: 'Title' },
              { name: 'body', label: 'Text', long: true },
            ]),
            picture('courseImage1', 'Photo for a course without its own photo'),
            picture('courseImage2', 'Second photo for a course without its own photo'),
            picture('detailImage', 'Photo on a course’s own page when it has no photo'),
            seo(),
          ],
        },
        {
          name: 'faq',
          label: 'FAQ',
          fields: [
            ...hero(),
            picture('heroImage', 'Top photo'),
            list('questions', 'Questions and answers', [
              { name: 'category', label: 'Group' },
              { name: 'question', label: 'Question' },
              { name: 'answer', label: 'Answer', long: true },
            ]),
            ...closing(),
            seo(),
          ],
        },
        {
          name: 'gifts',
          label: 'Gifts',
          fields: [...hero(), ...closing(), seo()],
        },
        {
          name: 'giftVouchers',
          label: 'Gift vouchers',
          fields: [...hero(), seo()],
        },
        {
          name: 'contact',
          label: 'Contact',
          fields: [
            ...hero(),
            paragraph('customIntro', 'Top text when arriving from a custom ring link'),
            paragraph('courseIntro', 'Top text when arriving from a course link'),
            { name: 'tipsHeading', label: 'Tips heading', type: 'text' },
            paragraph('tipsText', 'Tips text'),
            {
              name: 'courseTipsHeading',
              label: 'Tips heading when arriving from a course link',
              type: 'text',
            },
            paragraph('courseTipsText', 'Tips text when arriving from a course link'),
            seo(),
          ],
        },
        {
          name: 'blog',
          label: 'Journal',
          fields: [...hero(), seo()],
        },
        policy('terms', 'Terms'),
        policy('privacy', 'Privacy'),
        policy('cookies', 'Cookies'),
        policy('shipping', 'Shipping'),
        policy('returns', 'Returns'),
      ],
    },
  ],
}
