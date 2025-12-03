import type { Metadata } from 'next'
import { Container, Section } from '@/components/layout'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { TrustSignalBarCompact } from '@/components/trust'
import { ShieldCheck, Package, CreditCard, Gem, Wrench, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - The Good Opal Co',
  description: 'Find answers to common questions about Australian opals, our jewelry, shipping, returns, and more.',
}

const faqCategories = [
  {
    title: 'About Our Opals',
    icon: Gem,
    faqs: [
      {
        question: 'How do I know if the opal is authentic?',
        answer: 'Every opal we sell comes with a Certificate of Authenticity. Our opals are 100% natural Australian opals, sourced directly from mines in Lightning Ridge, Coober Pedy, Mintabie, and Andamooka. We never sell synthetic, lab-created, or imitation opals. Each certificate includes details about the stone\'s origin, type, weight, and unique characteristics.',
      },
      {
        question: 'What makes Australian opals special?',
        answer: 'Australia produces 95% of the world\'s precious opals and is home to the most vibrant and valuable opal varieties. Australian opals, particularly Black Opals from Lightning Ridge and Boulder Opals from Queensland, are renowned for their exceptional color play, fire, and brilliance. The unique geological conditions in Australia create opals unlike anywhere else in the world.',
      },
      {
        question: 'What\'s the difference between black and white opals?',
        answer: 'The main difference is the body tone. Black opals have a dark body tone (dark grey to black), which makes their color play appear more vibrant and dramatic. White opals have a lighter body tone (white to light grey). Black opals from Lightning Ridge are the rarest and most valuable, while white opals from Coober Pedy are more affordable but still stunning. The choice depends on your preference - both show beautiful color fire.',
      },
      {
        question: 'How do you grade opal quality?',
        answer: 'Opal quality is assessed based on several factors: body tone (darkness), brightness (intensity of color), color play (range of colors), pattern (arrangement of colors), clarity, and cut. The brightest, most vibrant colors on the darkest body tone command the highest prices. We carefully grade each opal and price them fairly based on these quality factors.',
      },
      {
        question: 'Why do opals have different colors?',
        answer: 'Opal\'s color play (called "play-of-color") is caused by the diffraction of light through microscopic silica spheres within the stone. As light enters the opal, it bends and splits into spectral colors. The size and arrangement of these spheres determines which colors you see. This is why each opal is completely unique - no two have the exact same internal structure.',
      },
    ],
  },
  {
    title: 'Purchasing & Authenticity',
    icon: ShieldCheck,
    faqs: [
      {
        question: 'Do you provide certificates of authenticity?',
        answer: 'Yes! Every opal piece comes with a Certificate of Authenticity that includes: stone type (Black Opal, Boulder Opal, etc.), origin location, weight in carats, measurements, metal details (for jewelry), and a unique certificate number. For high-value pieces over $5,000, we can arrange independent gemological certification from accredited labs.',
      },
      {
        question: 'What\'s your return policy?',
        answer: 'We offer a 30-day money-back guarantee on all purchases. If you\'re not completely satisfied with your opal jewelry, you can return it within 30 days of delivery for a full refund (minus return shipping). The item must be in its original condition with all packaging and certificates. Custom-made pieces have a 14-day return window. We want you to love your opal!',
      },
      {
        question: 'Are your opals ethically sourced?',
        answer: 'Absolutely. We work directly with licensed Australian opal miners who follow strict environmental and ethical standards. We personally visit the mines and know the miners we buy from. All mining is conducted in accordance with Australian government regulations. We believe in fair prices for miners and sustainable mining practices.',
      },
      {
        question: 'Can I see the opal before I buy?',
        answer: 'While we can\'t offer in-person viewings (as we\'re online-only), we provide multiple high-resolution photos and videos of each piece showing the opal from different angles and lighting conditions. We also offer video calls where we can show you the piece in real-time. Plus, our 30-day return policy gives you peace of mind to evaluate the opal at home.',
      },
      {
        question: 'Do you offer a warranty or guarantee?',
        answer: 'Yes! All our jewelry comes with a Lifetime Authenticity Guarantee - if your opal is ever found to be anything other than genuine Australian opal, we\'ll provide a full refund no matter how long you\'ve owned it. We also offer a 1-year warranty against manufacturing defects in the metalwork. Natural damage (chips, cracks from impact) is not covered, but we can often repair pieces for a fee.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    icon: Package,
    faqs: [
      {
        question: 'How long does shipping take?',
        answer: 'Australian domestic shipping: 3-7 business days via Australia Post with tracking. Express shipping (1-3 days) is available for an additional fee. International shipping: 7-21 business days depending on destination. All orders are processed within 1-2 business days. You\'ll receive tracking information as soon as your order ships.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship worldwide. International shipping costs vary by destination and package weight. All international orders include full tracking and insurance. Please note that international customers are responsible for any customs duties or import taxes in their country. We declare all items at their full value as required by law.',
      },
      {
        question: 'Is shipping free?',
        answer: 'We offer free standard shipping on all Australian orders over $500. For orders under $500, standard shipping is $15. Express shipping is available for $25. International shipping rates vary by country and are calculated at checkout based on your location and the weight of your order.',
      },
      {
        question: 'How are items packaged?',
        answer: 'Every piece of opal jewelry is carefully packaged in a beautiful presentation box with protective padding. The box is then placed in a shipping carton with additional cushioning. All orders over $1,000 require signature upon delivery for security. High-value items ship with full insurance and discreet packaging (no external markings indicating jewelry).',
      },
      {
        question: 'Can I track my order?',
        answer: 'Yes! Once your order ships, you\'ll receive an email with your tracking number and a link to track your package in real-time. You can also log into your account on our website to view order status and tracking information. If you have any questions about your shipment, our team is always happy to help.',
      },
    ],
  },
  {
    title: 'Payment & Security',
    icon: CreditCard,
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe payment gateway. We also accept Apple Pay and Google Pay for faster checkout. All payments are processed securely with 256-bit SSL encryption. We never store your full card details on our servers.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use Stripe, one of the world\'s most trusted payment processors, which is PCI-DSS compliant. All payment data is encrypted using industry-standard 256-bit SSL encryption. We never see or store your full credit card information. Your security is our top priority.',
      },
      {
        question: 'Do you offer payment plans or financing?',
        answer: 'For purchases over $2,000, we can arrange payment plans on a case-by-case basis. Please contact us to discuss options. We want to make owning beautiful Australian opal jewelry accessible while ensuring security for both parties. All payment plans require an initial deposit and signed agreement.',
      },
      {
        question: 'Can I pay in installments?',
        answer: 'We\'re currently setting up partnerships with buy-now-pay-later services like Afterpay and Zip for purchases up to $2,000. Check back soon or contact us for the latest information on installment payment options.',
      },
    ],
  },
  {
    title: 'Opal Care & Maintenance',
    icon: Wrench,
    faqs: [
      {
        question: 'How do I care for my opal jewelry?',
        answer: 'Opals are relatively soft (5.5-6.5 on Mohs scale) and require gentle care. Store separately from harder gemstones to avoid scratches. Clean with lukewarm water and mild soap using a soft cloth - never use ultrasonic cleaners, steam cleaners, or harsh chemicals. Remove opal jewelry before swimming, exercising, or doing household chores. With proper care, your opal will last generations.',
      },
      {
        question: 'Can opals get wet?',
        answer: 'Yes, opals can get wet! Contrary to popular myth, water won\'t damage solid opals. In fact, opals contain 5-10% water naturally. However, avoid prolonged soaking and always dry thoroughly. Remove opal jewelry before swimming in chlorinated pools or hot tubs, as chemicals can be harmful. Brief contact with water (washing hands, rain) is perfectly fine.',
      },
      {
        question: 'Will my opal crack or dry out?',
        answer: 'Solid opals (which is what we sell) are very stable and won\'t dry out under normal conditions. Cracks typically only occur from physical impact or extreme temperature changes. Avoid exposing opals to extreme heat (saunas, direct sunlight for extended periods) or rapid temperature changes. We include detailed care instructions with every purchase.',
      },
      {
        question: 'How should I store my opal jewelry?',
        answer: 'Store opals in a soft cloth pouch or lined jewelry box, separate from other jewelry to prevent scratching. Room temperature with normal humidity is ideal - no special storage required. Avoid storing in extremely dry environments (like safety deposit boxes in some climates) for very extended periods. Wearing your opal regularly is actually good for it!',
      },
      {
        question: 'Can you resize or repair opal jewelry?',
        answer: 'Yes! We offer resizing services for rings and repairs for all our jewelry. Resizing typically takes 2-3 weeks and costs $60-150 depending on the piece. Repairs are quoted on a case-by-case basis. We recommend having opals professionally checked and cleaned every 1-2 years. Contact us for specific repair or resizing needs.',
      },
    ],
  },
  {
    title: 'Custom Design & Commissions',
    icon: Gem,
    faqs: [
      {
        question: 'Can I create a custom piece of jewelry?',
        answer: 'Absolutely! Custom design is one of our specialties. You can either choose an opal from our inventory and design a setting around it, or we can source a specific type of opal based on your requirements (color, size, budget). Our in-house jewelers work with you to create a one-of-a-kind piece. The process typically takes 6-8 weeks from design approval to completion.',
      },
      {
        question: 'How does the custom design process work?',
        answer: '1) Initial consultation (phone/email/video) to discuss your vision and budget. 2) We provide opal options and design sketches. 3) You approve the design and opal selection. 4) We create your piece (6-8 weeks). 5) Final approval photos before shipping. 6) Your custom piece arrives with certificate. A 50% deposit is required to begin, with the balance due before shipping.',
      },
      {
        question: 'Can I use my own opal for a custom setting?',
        answer: 'Yes! If you have a family heirloom opal or a stone you\'ve purchased, we can create a beautiful setting for it. We\'ll need to evaluate the opal first (photos or in-person) to ensure it\'s suitable for setting and to design appropriately. Custom setting prices start at $800 for sterling silver and $1,500 for gold, depending on complexity.',
      },
      {
        question: 'What\'s the price range for custom pieces?',
        answer: 'Custom pieces typically range from $2,000 to $20,000+ depending on the opal (size, quality, rarity), metal choice (silver, gold, platinum), design complexity, and any additional gemstones. We can work with various budgets and will always be transparent about pricing before you commit. Simple custom settings start around $1,500 total.',
      },
    ],
  },
  {
    title: 'Contact & Support',
    icon: Mail,
    faqs: [
      {
        question: 'How can I contact you?',
        answer: 'Email us at info@goodopalco.com for any questions - we respond within 24 hours on business days. For urgent matters, call +61 (0)XXX XXX XXX during business hours (Monday-Friday, 9am-5pm AEST). You can also use the contact form on our website. We\'re here to help!',
      },
      {
        question: 'Do you have a physical store I can visit?',
        answer: 'We\'re currently online-only, which allows us to keep costs down and pass savings to you. However, we occasionally participate in jewelry shows and opal events around Australia. Follow us on Instagram @goodopalco for announcements about upcoming events where you can see our pieces in person.',
      },
      {
        question: 'Can I schedule a video call to see opals?',
        answer: 'Yes! We\'re happy to arrange video calls (Zoom, FaceTime, WhatsApp) where we can show you specific pieces in detail, demonstrate the opal\'s color play in different lighting, and answer any questions in real-time. Email us to schedule a time that works for you. This is especially popular for high-value purchases.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <Section className="bg-gradient-to-b from-cream to-white border-b border-warm-grey">
        <Container>
          <div className="max-w-3xl mx-auto text-center py-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-charcoal-80 leading-relaxed">
              Find answers to common questions about Australian opals, our jewelry,
              shipping, care, and more. Can&apos;t find what you&apos;re looking for?{' '}
              <a href="/contact" className="text-opal-blue hover:text-opal-blue-dark underline font-medium">
                Contact us
              </a>
              .
            </p>
          </div>
        </Container>
      </Section>

      {/* Trust Bar */}
      <TrustSignalBarCompact />

      {/* FAQ Content */}
      <Section className="py-16">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.title} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-opal-blue-pale flex items-center justify-center">
                      <Icon className="w-5 h-5 text-opal-blue" strokeWidth={2} />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-charcoal">
                      {category.title}
                    </h2>
                  </div>

                  {/* FAQ Accordion */}
                  <Accordion type="single" collapsible className="space-y-3">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`${category.title}-${index}`}
                        className="border border-warm-grey rounded-lg px-6 bg-white hover:border-opal-blue transition-colors"
                      >
                        <AccordionTrigger className="text-left font-semibold text-charcoal hover:text-opal-blue py-5">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-charcoal-80 leading-relaxed pb-5">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )
            })}
          </div>

          {/* Still have questions CTA */}
          <div className="max-w-2xl mx-auto mt-16 text-center p-8 bg-opal-blue-pale rounded-xl border border-opal-blue/20">
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-3">
              Still Have Questions?
            </h3>
            <p className="text-charcoal-80 mb-6">
              We&apos;re here to help! Our team of opal experts is ready to answer any questions
              you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-opal-blue hover:bg-opal-blue-dark text-white font-semibold transition-colors"
              >
                Contact Us
              </a>
              <a
                href="mailto:info@goodopalco.com"
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-2 border-opal-blue text-opal-blue hover:bg-opal-blue hover:text-white font-semibold transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
