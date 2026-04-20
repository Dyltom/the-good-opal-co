import type { Metadata } from 'next'
import { Container } from '@/components/layout'
import { Navigation, Footer } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { ShieldCheck, Package, CreditCard, Gem, Wrench, Mail } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - The Good Opal Co',
  description: 'Find answers to common questions about Australian opals, our jewellery, shipping, returns, and more.',
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
        answer: 'Yes! Every opal piece comes with a Certificate of Authenticity that includes: stone type (Black Opal, Boulder Opal, etc.), origin location, weight in carats, measurements, metal details (for jewellery), and a unique certificate number. For high-value pieces over $5,000, we can arrange independent gemological certification from accredited labs.',
      },
      {
        question: 'What\'s your return policy?',
        answer: 'We offer a 30-day money-back guarantee on all purchases. If you\'re not completely satisfied with your opal jewellery, you can return it within 30 days of delivery for a full refund (minus return shipping). The item must be in its original condition with all packaging and certificates. Custom-made pieces have a 14-day return window. We want you to love your opal!',
      },
      {
        question: 'Are your opals ethically sourced?',
        answer: 'Absolutely. We work directly with licensed Australian opal miners who follow strict environmental and ethical standards. We source our opals from trusted miners who adhere to Australian government regulations. We believe in fair prices for miners and sustainable mining practices.',
      },
      {
        question: 'Can I see the opal before I buy?',
        answer: 'While we can\'t offer in-person viewings (as we\'re online-only), we provide multiple high-resolution photos and videos of each piece showing the opal from different angles and lighting conditions. We also offer video calls where we can show you the piece in real-time. Plus, our 30-day return policy gives you peace of mind to evaluate the opal at home.',
      },
      {
        question: 'Do you offer a warranty or guarantee?',
        answer: 'Yes! All our jewellery comes with a Lifetime Authenticity Guarantee - if your opal is ever found to be anything other than genuine Australian opal, we\'ll provide a full refund no matter how long you\'ve owned it. We also offer a 1-year warranty against manufacturing defects in the metalwork. Natural damage (chips, cracks from impact) is not covered, but we can often repair pieces for a fee.',
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
        answer: 'Every piece of opal jewellery is carefully packaged in a beautiful presentation box with protective padding. The box is then placed in a shipping carton with additional cushioning. All orders over $1,000 require signature upon delivery for security. High-value items ship with full insurance and discreet packaging (no external markings indicating jewellery).',
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
        answer: 'For purchases over $2,000, we can arrange payment plans on a case-by-case basis. Please contact us to discuss options. We want to make owning beautiful Australian opal jewellery accessible while ensuring security for both parties. All payment plans require an initial deposit and signed agreement.',
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
        question: 'How do I care for my opal jewellery?',
        answer: 'Opals are relatively soft (5.5-6.5 on Mohs scale) and require gentle care. Store separately from harder gemstones to avoid scratches. Clean with lukewarm water and mild soap using a soft cloth - never use ultrasonic cleaners, steam cleaners, or harsh chemicals. Remove opal jewellery before swimming, exercising, or doing household chores. With proper care, your opal will last generations.',
      },
      {
        question: 'Can opals get wet?',
        answer: 'Yes, opals can get wet! Contrary to popular myth, water won\'t damage solid opals. In fact, opals contain 5-10% water naturally. However, avoid prolonged soaking and always dry thoroughly. Remove opal jewellery before swimming in chlorinated pools or hot tubs, as chemicals can be harmful. Brief contact with water (washing hands, rain) is perfectly fine.',
      },
      {
        question: 'Will my opal crack or dry out?',
        answer: 'Solid opals (which is what we sell) are very stable and won\'t dry out under normal conditions. Cracks typically only occur from physical impact or extreme temperature changes. Avoid exposing opals to extreme heat (saunas, direct sunlight for extended periods) or rapid temperature changes. We include detailed care instructions with every purchase.',
      },
      {
        question: 'How should I store my opal jewellery?',
        answer: 'Store opals in a soft cloth pouch or lined jewellery box, separate from other jewellery to prevent scratching. Room temperature with normal humidity is ideal - no special storage required. Avoid storing in extremely dry environments (like safety deposit boxes in some climates) for very extended periods. Wearing your opal regularly is actually good for it!',
      },
      {
        question: 'Can you resize or repair opal jewellery?',
        answer: 'Yes! We offer resizing services for rings and repairs for all our jewellery. Resizing typically takes 2-3 weeks and costs $60-150 depending on the piece. Repairs are quoted on a case-by-case basis. We recommend having opals professionally checked and cleaned every 1-2 years. Contact us for specific repair or resizing needs.',
      },
    ],
  },
  {
    title: 'Custom Design & Commissions',
    icon: Gem,
    faqs: [
      {
        question: 'Can I create a custom piece of jewellery?',
        answer: 'Absolutely! Custom design is one of our specialties. You can either choose an opal from our inventory and design a setting around it, or we can source a specific type of opal based on your requirements (colour, size, budget). Our in-house jewellers work with you to create a one-of-a-kind piece. The process typically takes 6-8 weeks from design approval to completion.',
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
        answer: 'Email us at thegoodopalco@gmail.com for any questions - we respond within 24 hours on business days. You can also reach us on Instagram @goodopalco for a quick response. We\'re here to help!',
      },
      {
        question: 'Do you have a physical store I can visit?',
        answer: 'We\'re currently online-only, which allows us to keep costs down and pass savings to you. However, we occasionally participate in jewellery shows and opal events around Australia. Follow us on Instagram @goodopalco for announcements about upcoming events where you can see our pieces in person.',
      },
      {
        question: 'Can I schedule a video call to see opals?',
        answer: 'Yes! We\'re happy to arrange video calls (Zoom, FaceTime, WhatsApp) where we can show you specific pieces in detail, demonstrate the opal\'s colour play in different lighting, and answer any questions in real-time. Email us to schedule a time that works for you. This is especially popular for high-value purchases.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-black-rich">
        <Navigation
          logo={{ id: 'logo', url: '/logo.png', alt: 'The Good Opal Co', width: 48, height: 48 }}
          items={[
            { href: '/store', label: 'Shop' },
            { href: '/blog', label: 'Blog' },
            { href: '/courses', label: 'Courses' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
            { href: '/faq', label: 'FAQ' },
          ]}
          transparent
        />

        <main className="flex-1">
          {/* Premium Header with Dark Background */}
          <section className="relative pt-40 pb-24 overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute inset-0">
              <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl bg-gradient-to-bl from-fire-pink to-opal-electric" />
              <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full opacity-15 blur-3xl bg-gradient-to-tr from-opal-teal to-opal-emerald" />
            </div>

            <Container>
              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <div className="mb-6">
                  <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium tracking-wider text-fire-pink uppercase">
                    Knowledge Center
                  </span>
                </div>
                <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-normal mb-6 text-white tracking-tight">
                  Frequently Asked <span className="text-gradient-prismatic">Questions</span>
                </h1>
                <p className="font-sans text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto">
                  Expert guidance on Australian opals, craftsmanship, and care
                </p>
              </div>
            </Container>
          </section>

          {/* FAQ Content - Dark Premium Design */}
          <section className="relative py-24 md:py-32 bg-gradient-to-b from-black-rich via-gray-900 to-black-rich">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02]">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
              }} />
            </div>

            <Container>
              <div className="relative z-10 max-w-5xl mx-auto">
                {faqCategories.map((category, categoryIndex) => {
                  const Icon = category.icon
                  const colors = [
                    'from-opal-electric to-opal-deep',
                    'from-fire-pink to-fire-coral',
                    'from-opal-emerald to-opal-teal',
                    'from-fire-orange to-fire-gold',
                    'from-opal-turquoise to-opal-electric',
                    'from-opal-pink to-fire-pink',
                  ]
                  const gradient = colors[categoryIndex % colors.length]

                  return (
                    <div key={category.title} className={cn(
                      "mb-20",
                      categoryIndex !== 0 && "pt-20 border-t border-white/10"
                    )}>
                      {/* Premium Category Header */}
                      <div className="mb-12">
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="font-accent text-sm font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 uppercase">
                              {category.title}
                            </h2>
                          </div>
                        </div>
                      </div>

                      {/* Premium Dark Accordion */}
                      <Accordion type="single" collapsible className="space-y-4">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem
                            key={index}
                            value={`${category.title}-${index}`}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300"
                          >
                            <AccordionTrigger className="px-6 py-5 hover:no-underline group">
                              <span className="font-sans text-left text-lg text-white/90 group-hover:text-white transition-colors pr-8 font-normal">
                                {faq.question}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-5">
                              <p className="font-sans text-white/70 leading-relaxed text-base">
                                {faq.answer}
                              </p>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )
                })}
              </div>

              {/* Premium CTA */}
              <div className="relative mt-32 text-center">
                <div className="max-w-2xl mx-auto p-16 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20">
                  <div className="mb-8 inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-fire-pink to-opal-electric shadow-lg">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-serif text-4xl font-medium text-white mb-4">
                    Need Personal Assistance?
                  </h3>
                  <p className="font-sans text-xl text-white/80 mb-12 leading-relaxed">
                    Our opal experts are available to guide you through your selection
                  </p>
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-fire-pink to-opal-electric hover:from-opal-electric hover:to-fire-pink text-white px-12 py-6 text-base font-medium tracking-wide w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                      asChild
                    >
                      <a href="mailto:goodopalco@gmail.com">
                        Schedule a Consultation
                      </a>
                    </Button>
                    <div className="font-sans text-sm text-white/60">
                      or message us <span className="text-fire-pink font-medium">@goodopalco</span> on Instagram
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </main>

        <Footer logoText="The Good Opal Co" />
      </div>
    </PageTransition>
  )
}
