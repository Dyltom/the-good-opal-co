import { Navigation } from './Navigation'
import { getNavigationProps } from '@/lib/constants/navigation'

export interface SiteNavigationProps {
  sticky?: boolean
  className?: string
}

export function SiteNavigation({ sticky = true, className }: SiteNavigationProps) {
  return <Navigation {...getNavigationProps({ sticky })} className={className} />
}
