import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Container } from '@/components/layout'
import { MarketingShell } from '@/components/marketing'
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo'
import { Button } from '@/components/ui/button'

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
          'Contact us within 30 days of delivery. Standard, unused pieces may be returned when they are undamaged and in their original condition and packaging. Return postage is paid by the customer. Contact us before sending an item back so we can confirm the correct steps.',
      },
      {
        question: 'Which items are excluded from change-of-mind returns?',
        answer:
          'Custom work is not eligible for change-of-mind returns. That covers commissions, custom rings, stones or parcels cut to order, and the deposit paid for custom work. Personalised, altered, worn, hygiene-sensitive, and final-sale pieces are excluded too. These exclusions do not limit your automatic rights under the Australian Consumer Law when an item is faulty or materially different from its description.',
      },
      {
        question: 'How do refunds work?',
        answer:
          'Contact us first, then return the piece once we confirm the steps. We refund to your original payment method through Stripe, and Klarna purchases are refunded through Klarna. A change-of-mind refund covers the item price; for a faulty or incorrect item we also refund the original shipping. Stripe says refunds usually take 5 to 10 business days to appear. Full details are on the returns page.',
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
        question: 'Do prices include GST?',
        answer:
          'No GST applies. The Good Opal Co is a small business that is not registered for GST, so the price you see is the price you pay. All prices and shipping charges are in Australian dollars (AUD). International orders pay the same price; import duties and local taxes in the destination country are the recipient’s responsibility.',
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
        question: 'Can I return custom work?',
        answer:
          'Not for a change of mind. Commissions, custom rings, stones or parcels cut to order, and the deposit paid to start them are made for you, so they are excluded from change-of-mind returns. If custom work is faulty or not as agreed, your rights under the Australian Consumer Law still apply.',
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
        items={[
          { name: 'Home', url: '/' },
          { name: 'Frequently asked questions', url: '/faq' },
        ]}
      />
      <Container className="pb-sec">
        <header className="grid items-center gap-[18px] pt-[18px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-[clamp(20px,3vw,56px)] md:pt-[clamp(20px,2.4vw,36px)]">
          <div>
            <h1 className="max-w-[14ch] text-[2.375rem] leading-[0.98] tracking-[-0.025em] md:text-[clamp(2.5rem,4.6vw,4.75rem)]">
              Clear answers <i>before you choose.</i>
            </h1>
            <p className="mt-3 max-w-[50ch] text-[15px] leading-[1.6] text-ink-2 md:mt-5 md:text-base">
              Product details, delivery, eligible returns, care, and custom work. If your question
              is specific to one opal, send us the product link.
            </p>
          </div>
          <div className="relative aspect-[16/9] overflow-hidden bg-plinth md:aspect-auto md:h-[clamp(220px,22vw,340px)]">
            <Image
              src="/images/products/20211012_174237.jpg"
              alt="Three polished white opals on a dark stone surface"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
        </header>

        <div className="pt-12 md:pt-[clamp(40px,4.5vw,72px)]">
          {faqCategories.map((category, categoryIndex) => (
            <section
              key={category.title}
              aria-labelledby={`faq-${categoryIndex}`}
              className="grid gap-3 border-t border-rule-2 pb-8 pt-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-[clamp(20px,3vw,56px)]"
            >
              <h2
                id={`faq-${categoryIndex}`}
                className="text-[1.625rem] leading-[1.1] tracking-[-0.015em] md:text-[clamp(1.625rem,2.4vw,2.25rem)]"
              >
                {category.title}
              </h2>
              <div>
                {category.faqs.map((faq) => (
                  <details key={faq.question} name={`faq-${categoryIndex}`} className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] leading-6 text-ink [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ChevronDown
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-ink-3 group-open:rotate-180 group-open:text-accent motion-safe:transition-transform motion-safe:duration-200"
                      />
                    </summary>
                    <p className="max-w-[65ch] pb-5 text-sm leading-6 text-ink-2">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="grid items-end gap-5 bg-plinth p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-10">
          <div>
            <h2 className="text-[clamp(1.875rem,3.2vw,3.125rem)] leading-[1.04] tracking-[-0.02em]">
              Still <i>deciding?</i>
            </h2>
            <p className="mt-3 max-w-[60ch] text-sm leading-6 text-ink-2">
              Send the product link and tell us what you need to see or understand. We will answer
              from the details available for that piece.
            </p>
          </div>
          <Button asChild>
            <Link href="/contact?subject=product-question">
              Ask about a piece <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </Container>
    </MarketingShell>
  )
}
