const JEWELLER_QUOTES = [
  {
    handle: 'charlottejstudio',
    text: 'Steph is an awesome opal cutter and gal based in melbourne. Check her out for custom parcels!',
  },
  {
    handle: 'charlottejstudio',
    text: 'Still in awe of how beautiful this white opal is! @thegoodopalco custom cut it for me',
  },
] as const

export function JewellerQuotes() {
  return (
    <div>
      <h3 className="font-sans text-xs font-medium uppercase tracking-[0.06em] text-ink-3">
        From jewellers who buy Steph&rsquo;s stones
      </h3>
      <ul className="mt-3 grid gap-5 sm:grid-cols-2 sm:gap-[clamp(16px,2vw,32px)]">
        {JEWELLER_QUOTES.map((quote) => (
          <li key={quote.text}>
            <figure>
              <blockquote className="text-pretty font-serif text-[19px] leading-[1.3] tracking-[-0.01em] text-ink">
                <p>&ldquo;{quote.text}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-2 text-[13px] text-ink-3">
                <a
                  href={`https://www.instagram.com/${quote.handle}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="-my-3 inline-block py-3 text-ink-2 underline decoration-rule-2 underline-offset-4 hover:text-ink hover:decoration-ink"
                >
                  @{quote.handle}
                </a>
                , jeweller, on Instagram
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
