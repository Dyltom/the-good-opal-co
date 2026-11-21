import { Eyebrow } from '@/components/ui/eyebrow'

type JewellerQuote = {
  handle: string
  text: string
}

const JEWELLER_QUOTES: readonly JewellerQuote[] = [
  {
    handle: 'charlottejstudio',
    text: 'Steph is an awesome opal cutter and gal based in melbourne. Check her out for custom parcels!',
  },
  {
    handle: 'charlottejstudio',
    text: 'Still in awe of how beautiful this white opal is! @thegoodopalco custom cut it for me',
  },
  {
    handle: 'earthandartjewellery',
    text: 'New opal babies from @thegoodopalco',
  },
]

function InstagramHandle({ handle }: { handle: string }) {
  return (
    <a
      href={`https://www.instagram.com/${handle}/`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline decoration-warm-grey underline-offset-4 hover:decoration-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opal-electric-accessible focus-visible:ring-offset-2"
    >
      @{handle}
    </a>
  )
}

export function JewellerQuotes() {
  return (
    <section
      aria-labelledby="jeweller-quotes"
      className="border-t border-warm-grey/55 bg-white px-5 py-12 sm:px-8 lg:px-12 lg:py-20"
    >
      <div className="mx-auto max-w-[90rem]">
        <Eyebrow>From their Instagram stories</Eyebrow>
        <h2
          id="jeweller-quotes"
          className="mt-4 text-balance font-serif text-3xl font-medium leading-tight text-charcoal sm:text-4xl"
        >
          What jewellers say.
        </h2>
        <ul className="mt-8 grid gap-8 md:mt-10 md:grid-cols-3 md:gap-10">
          {JEWELLER_QUOTES.map((quote) => (
            <li key={quote.text} className="border-t border-warm-grey/60 pt-5 md:pt-6">
              <figure>
                <blockquote className="font-serif text-lg leading-relaxed text-charcoal sm:text-xl">
                  <p>&ldquo;{quote.text}&rdquo;</p>
                </blockquote>
                <figcaption className="mt-3 font-sans text-sm text-charcoal/65 md:mt-4">
                  <InstagramHandle handle={quote.handle} />
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-8 font-sans text-sm leading-6 text-charcoal/65 md:mt-10">
          Jewellers like <InstagramHandle handle="makerand_element" /> order custom parcels.
        </p>
      </div>
    </section>
  )
}
