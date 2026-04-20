import { Navigation } from './Navigation'
import { AccountMenu } from './AccountMenu'
import { getSession } from '@/lib/auth-simple'
import type { NavigationProps } from '@/types'

export async function NavigationWrapper(props: NavigationProps) {
  const session = await getSession()

  return (
    <div className="relative">
      <Navigation {...props} />
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-50 hidden md:block">
        <AccountMenu user={session} />
      </div>
    </div>
  )
}
