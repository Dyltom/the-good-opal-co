import type { ReactNode } from 'react'
import { Footer, SiteNavigation } from '@/components/navigation'
import { PromoBar } from './PromoBar'

export interface MarketingShellProps {
  children: ReactNode
  showFooter?: boolean
}

export function MarketingShell({ children, showFooter = true }: MarketingShellProps) {
  return (
    <div className="flex min-h-screen flex-col text-ink">
      <PromoBar />
      <SiteNavigation />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  )
}
