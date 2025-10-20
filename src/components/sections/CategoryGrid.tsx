import { Container } from '@/components/layout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Category {
  name: string
  slug: string
  description: string
  gradient: string
}

interface CategoryGridProps {
  title?: string
  description?: string
  categories: Category[]
  className?: string
}

/**
 * Reusable Category Grid Component
 * Displays product categories as clickable cards
 */
export function CategoryGrid({
  title = 'Shop By Collection',
  description = 'Curated pieces showcasing the finest Australian opals',
  categories,
  className = '',
}: CategoryGridProps) {
  return (
    <section className={`py-20 md:py-24 ${className}`}>
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            {title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/store?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 ${category.gradient}`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 text-shadow">{category.name}</h3>
                <p className="text-sm md:text-base opacity-95 mb-6 text-center leading-relaxed">
                  {category.description}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white text-charcoal hover:bg-cream font-semibold shadow-lg"
                >
                  View Collection
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  )
}
