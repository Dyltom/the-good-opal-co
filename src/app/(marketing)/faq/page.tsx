import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | The Good Opal Co',
  description:
    'Clear answers about Australian opals, product details, delivery, eligible returns, payment, care, and custom work.',
  alternates: { canonical: '/faq' },
}

const faqCategories = [
  {
    title: 'Choosing an opal',
    faqs: [
      {
        question: 'What product information do you provide?',
        answer:
          'Each listing shows the details available for that individual piece, which may include its opal type, known origin, dimensions, weight, setting material, and treatment information. Contact us before ordering if a detail important to your decision is missing.',
      },
      {
        question: 'Does every piece include a certificate?',
        answer:
          'A certificate or independent report is only included when the product listing says so. We do not describe every piece as independently certified. The listing and order record are the primary source of product details.',
      },
      {
        question: 'Can I see a piece more closely before buying?',
        answer:
          'Yes. Ask for additional images or a virtual viewing if you need to inspect colour, scale, or a fine detail. Opal can look different under changing light and on different screens, so we encourage questions before purchase.',
      },
      {
        question: 'What is the difference between black, white, and boulder opal?',
        answer:
          'These names describe different body tones or formations. Black opal has a dark body tone, white opal has a pale body tone, and boulder opal remains attached to its ironstone host rock. Brightness, pattern, colour, condition, size, and personal preference all matter when comparing pieces.',
      },
    ],
  },
  {
    title: 'Delivery and returns',
    faqs: [
      {
        question: 'How much is delivery?',
        answer:
          'Tracked delivery is AUD 15 for orders under AUD 500. Tracked delivery is free when the order subtotal is AUD 500 or more. Available destinations and the final delivery charge are shown during checkout.',
      },
      {
        question: 'Will I receive tracking?',
        answer:
          'Tracked delivery is used where available. We send the tracking details after dispatch. Delivery timing depends on the destination and carrier, so any estimate is not a guaranteed arrival date.',
      },
      {
        question: 'What is the change-of-mind return policy?',
        answer:
          'Contact us within 30 days of delivery. Standard, unused pieces may be returned when they remain in their original condition and packaging. Return postage is paid by the customer. Contact us before sending an item back so we can confirm the correct steps.',
      },
      {
        question: 'Which items are excluded from change-of-mind returns?',
        answer:
          'Custom, personalised, altered, worn, hygiene-sensitive, and final-sale pieces are not eligible for change-of-mind returns. These exclusions do not limit your automatic rights under the Australian Consumer Law when an item is faulty or materially different from its description.',
      },
    ],
  },
  {
    title: 'Payment and order help',
    faqs: [
      {
        question: 'How is payment handled?',
        answer:
          'Available payment methods appear at checkout. Payment details are collected and processed by Stripe, and The Good Opal Co does not store your full card number.',
      },
      {
        question: 'What should I do if something is wrong with my order?',
        answer:
          'Contact us promptly with your order number, a description of the issue, and clear photographs when possible. We will assess the item and explain the applicable repair, replacement, refund, or other remedy.',
      },
      {
        question: 'Can I change or cancel an order?',
        answer:
          'Contact us as soon as possible. We may be able to help before an order enters packing or dispatch, but changes and cancellations cannot be promised once fulfilment has started.',
      },
    ],
  },
  {
    title: 'Opal care',
    faqs: [
      {
        question: 'How should I clean opal jewellery?',
        answer:
          'Use a soft, damp cloth. For solid opal, a small amount of mild soap and lukewarm water may be suitable. Avoid ultrasonic or steam cleaners, harsh chemicals, prolonged soaking, and sudden temperature changes. Ask us first if you are unsure whether your piece is solid opal, a doublet, or a triplet.',
      },
      {
        question: 'How should I store an opal?',
        answer:
          'Store it separately in a soft pouch or lined box so harder jewellery cannot scratch it. Remove opal jewellery before sport, household work, swimming, or any activity where it may be knocked or exposed to chemicals.',
      },
      {
        question: 'Can you help with resizing or repairs?',
        answer:
          'Contact us with photographs and the relevant order or product details. Suitability, cost, and timing depend on the construction, condition, and required work, so we confirm these after assessment.',
      },
    ],
  },
  {
    title: 'Custom work',
    faqs: [
      {
        question: 'Can I request a custom piece?',
        answer:
          'Yes. Start with the type of piece, preferred metal, approximate size, budget, timing, and any opal colours or patterns you like. We will confirm whether the project is suitable before any commitment.',
      },
      {
        question: 'How are custom price and timing decided?',
        answer:
          'Both depend on the chosen opal, metal, design complexity, specialist work, and current availability. We provide the agreed scope, expected timing, price, and payment stages for your project before work begins.',
      },
      {
        question: 'Can you work with an opal I already own?',
        answer:
          'Possibly. The stone must be assessed for condition, dimensions, and suitability before we can propose a setting or accept responsibility for the work. Send clear photographs and any known history through the contact form.',
      },
    ],
  },
]

export default function FAQPage() {
  const allFaqs = faqCategories.flatMap((category) => category.faqs)

  return (
    <MarketingShell>
        <FaqJsonLd items={allFaqs} />
        <BreadcrumbJsonLd
          items={[{ name: 'Home', url: '/' }, { name: 'Frequently asked questions', url: '/faq' }]}
        />
        <section className="border-b border-warm-grey/60">
          <Container className="py-14 sm:py-20 lg:py-24">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
              <div className="max-w-2xl">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-fire-pink-dark">
                  Buyer guide
                </p>
                <h1 className="mt-5 text-balance font-serif text-5xl font-medium leading-none text-charcoal sm:text-6xl">
                  Clear answers before you choose.
                </h1>
                <p className="mt-7 max-w-xl font-sans text-lg leading-8 text-charcoal/70">
                  Product details, delivery, eligible returns, care, and custom work. If your question is specific to one opal, send us the product link.
                </p>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bg-charcoal">
                <Image
                  src="/images/founders.jpg"
                  alt="A polished Australian opal under direct light"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </Container>
        </section>

        <Container className="py-16 sm:py-20 lg:py-28">
          <div className="mx-auto max-w-4xl">
            {faqCategories.map((category, categoryIndex) => (
              <section
                key={category.title}
                className={categoryIndex === 0 ? '' : 'mt-14 border-t border-warm-grey/60 pt-14'}
              >
                <div className="grid gap-6 sm:grid-cols-[10rem_1fr] sm:gap-10">
                  <h2 className="font-serif text-2xl font-medium text-charcoal">
                    {category.title}
                  </h2>
                  <Accordion type="single" collapsible>
                    {category.faqs.map((faq, index) => (
                      <AccordionItem
                        key={faq.question}
                        value={`${categoryIndex}-${index}`}
                        className="border-warm-grey/70"
                      >
                        <AccordionTrigger className="py-5 text-left font-sans text-base font-semibold leading-6 text-charcoal hover:text-opal-electric-accessible hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="max-w-2xl pb-6 font-sans text-sm leading-7 text-charcoal/70">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>
            ))}

            <section className="mt-20 border-t border-charcoal pt-10 sm:flex sm:items-end sm:justify-between sm:gap-10">
              <div className="max-w-xl">
                <h2 className="font-serif text-3xl font-medium text-charcoal">
                  Still deciding?
                </h2>
                <p className="mt-4 font-sans text-sm leading-7 text-charcoal/70">
                  Send the product link and tell us what you need to see or understand. We will answer from the details available for that piece.
                </p>
              </div>
              <Link
                href="/contact?subject=product-question"
                className="mt-7 inline-flex min-h-12 shrink-0 items-center justify-center rounded-md bg-charcoal px-6 font-sans text-sm font-semibold text-cream transition-colors hover:bg-charcoal-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2 sm:mt-0"
              >
                Ask about a piece
              </Link>
            </section>
          </div>
        </Container>
    </MarketingShell>
  )
}
