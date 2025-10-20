'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Container, Section, Grid } from '@/components/layout'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from './SectionHeader'
import type { GalleryImage } from '@/types'

/**
 * Gallery Section Props
 */
interface GallerySectionProps {
  title?: string
  description?: string
  images: Array<Pick<GalleryImage, 'id' | 'image' | 'category'>>
  columns?: 2 | 3 | 4
  showCategories?: boolean
}

/**
 * Gallery Section Component
 * Responsive image gallery with optional category filtering
 */
export function GallerySection({
  title = 'Gallery',
  description,
  images,
  columns = 3,
  showCategories = true,
}: GallerySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  if (images.length === 0) return null

  // Get unique categories
  const categories = Array.from(
    new Set(images.map((img) => img.category).filter(Boolean))
  ) as string[]

  // Filter images by category
  const filteredImages = selectedCategory
    ? images.filter((img) => img.category === selectedCategory)
    : images

  return (
    <Section padding="lg">
      <Container>
        <SectionHeader title={title} description={description} className="mb-8" />

        {/* Category Filter */}
        {showCategories && categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge
              variant={selectedCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <Grid cols={columns} gap="sm">
          {filteredImages.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-lg bg-muted group cursor-pointer"
            >
              <Image
                src={item.image.url}
                alt={item.image.alt}
                fill
                className="object-cover transition-transform group-hover:scale-110"
              />
              {item.image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-sm text-white">{item.image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </Grid>
      </Container>
    </Section>
  )
}
