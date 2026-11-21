export const HELP_LINKS = {
  products: [
    { label: 'Add a new piece', anchor: 'adding-a-new-piece' },
    { label: 'Photos', anchor: 'photos' },
    { label: 'Draft, Published and Archived', anchor: 'draft-published-and-archived' },
    { label: 'Sold pieces', anchor: 'sold-pieces' },
  ],
  orders: [
    { label: 'When someone buys', anchor: 'when-someone-buys' },
    { label: 'Post an order', anchor: 'posting-an-order' },
    { label: 'Refund an order', anchor: 'refunds' },
  ],
  'custom-quotes': [
    { label: 'Send a quote', anchor: 'sending-a-quote' },
    { label: 'Change a sent quote', anchor: 'once-it-is-sent' },
    { label: 'Acceptance and deposits', anchor: 'when-the-customer-accepts-and-pays' },
  ],
  enquiries: [
    { label: 'Work through an enquiry', anchor: 'working-through-an-enquiry' },
    { label: 'Video viewings', anchor: 'enquiries-and-video-viewings' },
    { label: 'Custom design requests', anchor: 'custom-designs-and-quotes' },
  ],
} as const

export type HelpTopic = keyof typeof HELP_LINKS

export const HELP_PATH = '/admin/help'
