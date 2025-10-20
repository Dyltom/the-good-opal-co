import { Container } from '@/components/layout'

interface Feature {
  icon: string
  title: string
  description: string
}

interface FeaturesGridProps {
  title?: string
  description?: string
  features: Feature[]
  columns?: 2 | 3 | 4 | 6
  className?: string
}

/**
 * Reusable Features Grid Component
 * Display features, benefits, or why-choose-us sections
 */
export function FeaturesGrid({
  title = 'Why Choose Us',
  description,
  features,
  columns = 3,
  className = '',
}: FeaturesGridProps) {
  const gridClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    6: 'md:grid-cols-6',
  }[columns]

  return (
    <section className={`py-20 ${className}`}>
      <Container>
        {(title || description) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className={`grid ${gridClass} gap-8`}>
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-opal-blue/10 to-opal-teal/10 flex items-center justify-center">
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm md:text-base">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
