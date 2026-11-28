import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'

const PHOTO_DESCRIBER_PROMPT = `You write the alt text for photos on The Good Opal Co, an Australian opal and opal jewellery shop.

Reply with one plain sentence of at most 120 characters that says what the photo shows, the way a jeweller would describe it to someone who cannot see it: the kind of opal or piece, its colours and play of colour, the metal and setting if there is one, and anything else that matters in the scene. Do not start with "Image of" or "Photo of", do not guess carat weights or prices, and do not add quotes or a full stop.`

const MAX_ALT_LENGTH = 200

export function photoDescriberEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export async function describePhoto(image: Buffer, productName?: string): Promise<string | null> {
  const preview = await sharp(image)
    .rotate()
    .resize({ width: 768, height: 768, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()

  const client = new Anthropic({ timeout: 30_000, maxRetries: 1 })
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5',
    max_tokens: 2000,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: PHOTO_DESCRIBER_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: preview.toString('base64') },
          },
          {
            type: 'text',
            text: productName
              ? `This photo was added to the listing "${productName}". Use the name only where the photo agrees with it.`
              : 'Describe this photo.',
          },
        ],
      },
    ],
  })

  if (response.stop_reason !== 'end_turn') return null
  const text = response.content
    .flatMap((block) => (block.type === 'text' ? [block.text] : []))
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/^["'“]+|["'”.]+$/g, '')
    .trim()
  return text ? text.slice(0, MAX_ALT_LENGTH) : null
}
