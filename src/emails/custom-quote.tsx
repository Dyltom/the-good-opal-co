import { formatPrice } from '@/lib/utils'

export interface CustomQuoteEmailProps {
  customerName: string
  depositAmountCents: number
  quoteNumber: string
  quoteUrl: string
  revision: number
  supportEmail: string
  totalAmountCents: number
  validUntil: string
}

export function CustomQuoteEmail({
  customerName,
  depositAmountCents,
  quoteNumber,
  quoteUrl,
  revision,
  supportEmail,
  totalAmountCents,
  validUntil,
}: CustomQuoteEmailProps) {
  const revisionLabel = revision > 1 ? ` · Revision ${revision}` : ''

  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <title>Your custom jewellery quote is ready</title>
      </head>
      <body
        style={{
          backgroundColor: '#f2eee6',
          color: '#27251f',
          fontFamily: "Georgia, 'Times New Roman', serif",
          margin: 0,
          padding: '24px 12px',
        }}
      >
        <div
          style={{
            display: 'none',
            fontSize: '1px',
            lineHeight: '1px',
            maxHeight: 0,
            maxWidth: 0,
            opacity: 0,
            overflow: 'hidden',
          }}
        >
          Review your personal quote from The Good Opal Co before {validUntil}.
        </div>
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          role="presentation"
          style={{ margin: '0 auto', maxWidth: '620px' }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  backgroundColor: '#17352f',
                  borderRadius: '18px 18px 0 0',
                  color: '#fffdf8',
                  padding: '34px 36px 30px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    color: '#d8c69c',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    margin: '0 0 14px',
                    textTransform: 'uppercase',
                  }}
                >
                  The Good Opal Co
                </p>
                <h1 style={{ fontSize: '31px', fontWeight: 500, lineHeight: 1.2, margin: 0 }}>
                  Your custom quote is ready
                </h1>
                <p style={{ color: '#dce6df', fontSize: '15px', margin: '12px 0 0' }}>
                  {quoteNumber}
                  {revisionLabel}
                </p>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: '#fffdf8',
                  borderLeft: '1px solid #ded7c9',
                  borderRight: '1px solid #ded7c9',
                  padding: '38px 36px 34px',
                }}
              >
                <p style={{ fontSize: '18px', lineHeight: 1.65, margin: '0 0 18px' }}>
                  Hi {customerName},
                </p>
                <p
                  style={{
                    color: '#555148',
                    fontSize: '16px',
                    lineHeight: 1.7,
                    margin: '0 0 26px',
                  }}
                >
                  We&apos;ve prepared the details for your one-of-a-kind piece. You can securely
                  review the design, pricing, deposit and terms before deciding whether to accept.
                </p>

                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  role="presentation"
                  style={{ backgroundColor: '#f5f0e7', borderRadius: '12px', margin: '0 0 28px' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ padding: '22px 24px 12px' }}>
                        <p
                          style={{
                            color: '#6b655a',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '12px',
                            letterSpacing: '1px',
                            margin: '0 0 5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Quoted total
                        </p>
                        <p style={{ fontSize: '25px', margin: 0 }}>
                          {formatPrice(totalAmountCents)} AUD
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 24px 22px' }}>
                        <p
                          style={{
                            color: '#6b655a',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '12px',
                            letterSpacing: '1px',
                            margin: '0 0 5px',
                            textTransform: 'uppercase',
                          }}
                        >
                          Deposit after acceptance
                        </p>
                        <p style={{ fontSize: '18px', margin: 0 }}>
                          {depositAmountCents > 0
                            ? `${formatPrice(depositAmountCents)} AUD`
                            : 'No deposit required'}
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                  <tbody>
                    <tr>
                      <td align="center" style={{ padding: '2px 0 24px' }}>
                        <a
                          href={quoteUrl}
                          aria-label={`Review custom quote ${quoteNumber}`}
                          style={{
                            backgroundColor: '#a44b2d',
                            borderRadius: '999px',
                            color: '#ffffff',
                            display: 'inline-block',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '16px',
                            fontWeight: 700,
                            padding: '15px 29px',
                            textDecoration: 'none',
                          }}
                        >
                          Review your quote securely
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p
                  style={{
                    color: '#555148',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '14px',
                    lineHeight: 1.65,
                    margin: '0 0 12px',
                    textAlign: 'center',
                  }}
                >
                  Valid until <strong>{validUntil}</strong>. Opening the quote does not accept it or
                  take payment.
                </p>
                <p
                  style={{
                    color: '#777064',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    margin: '18px 0 0',
                    overflowWrap: 'anywhere',
                    textAlign: 'center',
                  }}
                >
                  Button not working? Copy this secure link into your browser:
                  <br />
                  <a href={quoteUrl} style={{ color: '#165f78' }}>
                    {quoteUrl}
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: '#e7dfd1',
                  borderRadius: '0 0 18px 18px',
                  color: '#5c574e',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  padding: '24px 36px',
                  textAlign: 'center',
                }}
              >
                Questions about your design? Email{' '}
                <a href={`mailto:${supportEmail}`} style={{ color: '#165f78' }}>
                  {supportEmail}
                </a>
                .<br />
                The Good Opal Co · Sydney, NSW, Australia
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export default CustomQuoteEmail
