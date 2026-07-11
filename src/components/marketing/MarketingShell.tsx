import type { ReactNode } from 'react'
import { Footer, SiteNavigation } from '@/components/navigation'
import { cn } from '@/lib/utils'

export interface MarketingShellProps {
  children: ReactNode
  className?: string
  mainClassName?: string
  showFooter?: boolean
}

export function MarketingShell({
  children,
  className,
  mainClassName,
  showFooter = true,
}: MarketingShellProps) {
  return (
    <div className={cn('min-h-screen bg-cream text-charcoal', className)}>
      <SiteNavigation />
      <main id="main-content" tabIndex={-1} className={cn('pt-20', mainClassName)}>
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </div>
  )
}
