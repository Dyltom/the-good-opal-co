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
      className="-my-3 inline-block py-3 text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink hover:decoration-ink"
    >
      @{handle}
    </a>
  )
}

export function JewellerQuotes() {
  return (
    <section aria-labelledby="jeweller-quotes" className="px-gut pt-sec">
      <h2 id="jeweller-quotes">What jewellers say</h2>
      <ul className="mt-[clamp(28px,3vw,44px)] grid gap-[22px] md:grid-cols-3 md:gap-[clamp(16px,2.4vw,40px)]">
        {JEWELLER_QUOTES.map((quote) => (
          <li key={quote.text} className="border-t border-rule-2 pt-5">
            <figure>
              <blockquote className="text-pretty font-serif text-[clamp(20px,1.6vw,25px)] leading-[1.3] tracking-[-0.01em] text-ink">
                <p>&ldquo;{quote.text}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-3.5 text-[13px] text-ink-3">
                <InstagramHandle handle={quote.handle} />, in their Instagram stories
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm leading-6 text-ink-2">
        Jewellers like <InstagramHandle handle="makerand_element" /> order custom parcels.
      </p>
    </section>
  )
}
