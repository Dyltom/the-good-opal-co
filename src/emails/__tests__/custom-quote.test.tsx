import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CustomQuoteEmail } from '../custom-quote'

const quoteUrl = 'https://goodopalco.com/quote/access/signed-token'

describe('CustomQuoteEmail', () => {
  it('renders the immutable quote summary, secure CTA, fallback link, and support contact', () => {
    const html = renderToStaticMarkup(
      <CustomQuoteEmail
        customerName="Mia"
        depositAmountCents={12500}
        quoteNumber="QUOTE-ABC123-R2"
        quoteUrl={quoteUrl}
        revision={2}
        supportEmail="hello@goodopalco.com"
        totalAmountCents={85000}
        validUntil="31 July 2026"
      />
    )

    expect(html).toContain('Your custom quote is ready')
    expect(html).toContain('QUOTE-ABC123-R2 · Revision 2')
    expect(html).toContain('$850.00 AUD')
    expect(html).toContain('$125.00 AUD')
    expect(html).toContain('Valid until <strong>31 July 2026</strong>')
    expect(html.match(new RegExp(`href="${quoteUrl}"`, 'g'))).toHaveLength(2)
    expect(html).toContain('aria-label="Review custom quote QUOTE-ABC123-R2"')
    expect(html).toContain('Opening the quote does not accept it or take payment')
    expect(html).toContain('href="mailto:hello@goodopalco.com"')
  })

  it('escapes customer-controlled values and explains a zero-deposit quote', () => {
    const html = renderToStaticMarkup(
      <CustomQuoteEmail
        customerName={'<img src=x onerror="alert(1)">'}
        depositAmountCents={0}
        quoteNumber={'QUOTE-<script>'}
        quoteUrl={quoteUrl}
        revision={1}
        supportEmail="hello@goodopalco.com"
        totalAmountCents={50000}
        validUntil="31 July 2026"
      />
    )

    expect(html).not.toContain('<img src=x')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
    expect(html).toContain('QUOTE-&lt;script&gt;')
    expect(html).toContain('No deposit required')
  })
})
