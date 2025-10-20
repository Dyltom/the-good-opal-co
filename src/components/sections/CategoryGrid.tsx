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
    <section className={`py-20 ${className}`}>
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-muted-foreground">{description}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/store?category=${category.slug}`}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <div className={`absolute inset-0 ${category.gradient}`} />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm md:text-base opacity-90 mb-4 text-center">
                  {category.description}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/90 text-gray-900 hover:bg-white font-semibold"
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
