import { getNewsletterService } from './service'

export interface JoinListState {
  status: 'idle' | 'joined' | 'error'
  message: string
}

export const JOIN_LIST_FAILED: JoinListState = {
  status: 'error',
  message: 'We could not add you just now. Use the sign-up form at the bottom of the page instead.',
}

export async function subscribeCheckoutBuyer(
  email: string,
  name: string | undefined
): Promise<JoinListState> {
  try {
    const result = await getNewsletterService().subscribe(email, {
      name,
      source: 'checkout',
      skipConfirmation: true,
      tags: ['buyer'],
    })
    if (result.success) {
      return { status: 'joined', message: 'You are on the list. A welcome email is on its way.' }
    }
    if (/already subscribed/i.test(result.message)) {
      return { status: 'joined', message: 'You are already on the list.' }
    }
    return JOIN_LIST_FAILED
  } catch (error) {
    console.error('Checkout newsletter opt-in failed:', error)
    return JOIN_LIST_FAILED
  }
}
