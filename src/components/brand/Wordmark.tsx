import { cn } from '@/lib/utils'

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('whitespace-nowrap font-serif leading-none tracking-[-0.01em]', className)}>
      The Good <i>Opal</i> Co
    </span>
  )
}
