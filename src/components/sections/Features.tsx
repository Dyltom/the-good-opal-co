import { Container, Grid, Section } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { SectionHeader } from './SectionHeader'
import type { FeaturesSectionData } from '@/types'

/**
 * Features Section Component
 * Display features in a grid layout
 */
export function Features({
  title,
  description,
  features,
  layout = 'grid',
  columns = 3,
}: FeaturesSectionData) {
  return (
    <Section padding="lg">
      <Container>
        <SectionHeader title={title} description={description} />

        {/* Features */}
        {layout === 'grid' ? (
          <Grid cols={columns as 2 | 3 | 4} gap="lg">
            {features.map((feature, index) => (
              <Card key={index} className="p-6">
                {feature.icon && (
                  <div className="mb-4 text-4xl" aria-hidden="true">
                    {feature.icon}
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </Grid>
        ) : (
          <div className="space-y-8 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                {feature.icon && (
                  <div className="flex-shrink-0 text-3xl text-primary" aria-hidden="true">
                    {feature.icon}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
