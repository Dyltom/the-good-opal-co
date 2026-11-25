import { formatCurrency } from '@/lib/utils'
import { EmailFrame, emailColors, emailText } from './email-frame'

export interface SavedBagLine {
  name: string
  slug: string
  quantity: number
  price: number
  image?: string
}

interface SavedBagEmailProps {
  lines: SavedBagLine[]
  baseUrl: string
  supportEmail: string
}

function absolute(baseUrl: string, path: string | undefined): string | undefined {
  if (!path) return undefined
  return path.startsWith('/') ? `${baseUrl}${path}` : path
}

export function SavedBagEmail({ lines, baseUrl, supportEmail }: SavedBagEmailProps) {
  const button = {
    backgroundColor: emailColors.ink,
    color: emailColors.paper,
    display: 'inline-block',
    fontFamily: 'Arial, sans-serif',
    fontSize: '15px',
    fontWeight: 700,
    padding: '14px 26px',
    textDecoration: 'none',
  }

  return (
    <EmailFrame
      preview="The pieces you saved at The Good Opal Co."
      baseUrl={baseUrl}
      supportEmail={supportEmail}
    >
      <p style={emailText.eyebrow}>Your bag</p>
      <h1 style={emailText.heading}>The pieces you saved</h1>
      <p style={emailText.body}>
        Here is your bag, ready for when you are. Pieces are not held until you pay, and most of our
        opals are one of a kind, so they go to whoever checks out first.
      </p>

      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        role="presentation"
        style={{ margin: '20px 0 24px' }}
      >
        <tbody>
          {lines.map((line) => {
            const url = `${baseUrl}/store/${line.slug}`
            const image = absolute(baseUrl, line.image)
            return (
              <tr key={line.slug}>
                <td
                  style={{
                    borderTop: `1px solid ${emailColors.rule}`,
                    padding: '12px 14px 12px 0',
                    width: '88px',
                  }}
                >
                  {image ? (
                    <a href={url}>
                      <img
                        src={image}
                        alt={line.name}
                        width="88"
                        height="88"
                        style={{ display: 'block', objectFit: 'cover' }}
                      />
                    </a>
                  ) : null}
                </td>
                <td
                  style={{
                    borderTop: `1px solid ${emailColors.rule}`,
                    padding: '12px 0',
                    verticalAlign: 'middle',
                  }}
                >
                  <a
                    href={url}
                    style={{ color: emailColors.ink, fontSize: '16px', textDecoration: 'none' }}
                  >
                    {line.name}
                  </a>
                  <p style={{ ...emailText.small, margin: '4px 0 0' }}>
                    {line.quantity > 1 ? `${line.quantity} × ` : ''}
                    {formatCurrency(line.price, 'AUD')}
                  </p>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <p style={{ margin: '0 0 12px' }}>
        <a href={`${baseUrl}/cart`} style={button}>
          Return to your bag
        </a>
      </p>
      <p style={{ ...emailText.small, margin: '0 0 26px' }}>
        Your bag stays in the browser you saved it from for a week. On another device, tap a piece
        above to add it again.
      </p>

      <h2 style={emailText.subheading}>When you are ready</h2>
      <ul style={{ ...emailText.body, margin: '0 0 14px', paddingLeft: '20px' }}>
        <li style={{ marginBottom: '6px' }}>
          Pay by card, Apple Pay or Klarna on Stripe&apos;s secure checkout.
        </li>
        <li style={{ marginBottom: '6px' }}>
          Tracked Australia Post delivery. Australian orders over $100 are insured and need a
          signature.
        </li>
        <li>
          Read our{' '}
          <a href={`${baseUrl}/returns`} style={{ color: emailColors.link }}>
            returns policy
          </a>{' '}
          before you buy.
        </li>
      </ul>
      <p style={emailText.body}>Questions about a stone? Reply to this email and we will help.</p>

      <p style={{ ...emailText.small, marginTop: '26px' }}>
        You asked us to email this bag from goodopalco.com. We have not added you to any mailing
        list.
      </p>
    </EmailFrame>
  )
}
