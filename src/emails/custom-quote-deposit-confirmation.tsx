import { formatPrice } from '@/lib/utils'

export function CustomQuoteDepositConfirmationEmail({
  depositAmountCents,
  quoteNumber,
  supportEmail,
}: {
  depositAmountCents: number
  quoteNumber: string
  supportEmail: string
}) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <title>Your custom jewellery deposit is confirmed</title>
      </head>
      <body style={{ backgroundColor: '#f2eee6', color: '#27251f', margin: 0, padding: 24 }}>
        <div
          style={{
            backgroundColor: '#fffdf8',
            border: '1px solid #ded7c9',
            borderRadius: 18,
            fontFamily: "Georgia, 'Times New Roman', serif",
            margin: '0 auto',
            maxWidth: 580,
            padding: 36,
          }}
        >
          <p style={{ color: '#a44b2d', fontFamily: 'Arial, sans-serif', fontWeight: 700 }}>
            THE GOOD OPAL CO
          </p>
          <h1 style={{ fontSize: 30, fontWeight: 500 }}>Your deposit is confirmed</h1>
          <p style={{ fontSize: 17, lineHeight: 1.7 }}>
            We received <strong>{formatPrice(depositAmountCents)} AUD</strong> for {quoteNumber}.
            Your accepted quote and payment evidence are safely recorded. We’ll contact you with the
            next production update.
          </p>
          <p style={{ color: '#5c574e', fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
            Questions? Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </p>
        </div>
      </body>
    </html>
  )
}
