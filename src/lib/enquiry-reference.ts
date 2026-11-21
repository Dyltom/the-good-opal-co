import { randomBytes } from 'node:crypto'

export function newEnquiryReference(): string {
  return `ENQ-${randomBytes(5).toString('hex').toUpperCase()}`
}
