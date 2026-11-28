import type { Field, GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'
import { isAdmin } from '../../lib/payload-access.ts'

export const SITE_CONTENT_PATHS = ['/', '/about', '/services'] as const

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

function closing(): Field[] {
  return [
    heading('closingHeading', 'Closing band heading'),
    paragraph('closingText', 'Closing band text'),
    picture('closingImage', 'Closing band photo'),
  ]
}

const revalidatePages: GlobalAfterChangeHook = ({ req }) => {
  try {
    for (const page of SITE_CONTENT_PATHS) revalidatePath(page)
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
      'Text and photos on the home, about and services pages. Empty fields keep the current wording or photo.',
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
          ],
        },
      ],
    },
  ],
}
