import { Container, Section } from '@/components/layout'
import { SectionHeader } from './SectionHeader'
import type { StatsSectionData } from '@/types'
import { cn } from '@/lib/utils'

/**
 * Stats Section Component
 * Display statistics/numbers in an eye-catching format
 */
export function Stats({ title, stats, layout = 'grid' }: StatsSectionData) {
  return (
    <Section padding="lg" background="muted">
      <Container>
        <SectionHeader title={title} />

        <div
          className={cn(
            'gap-8',
            layout === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-4'
              : 'flex flex-wrap justify-center'
          )}
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
