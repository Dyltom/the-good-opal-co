import { Navigation } from './Navigation'
import { AccountMenu } from './AccountMenu'
import { getSession } from '@/lib/auth-simple'
import type { NavigationProps } from '@/types'

export async function NavigationWrapper(props: NavigationProps) {
  const session = await getSession()

  return (
    <Navigation
      {...props}
      accountMenu={<AccountMenu user={session} />}
    />
  )
}