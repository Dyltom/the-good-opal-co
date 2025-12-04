import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9'
  priority?: boolean
  quality?: number
  className?: string
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
  onLoad?: () => void
  loading?: 'lazy' | 'eager'
}

/**
 * OptimizedImage component following SOLID principles
 * Single Responsibility: Handles image optimization and consistent aspect ratios
 * Open/Closed: Can be extended with new aspect ratios without modifying the component
 * Interface Segregation: Props interface only contains necessary image properties
 */
export function OptimizedImage({
  aspectRatio = '16:9',
  quality = 85,
  sizes = '100vw',
  loading = 'lazy',
  fill = true,
  width,
  height,
  className,
  ...props
}: OptimizedImageProps) {
  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '21:9': 'aspect-[21/9]',
  }

  const aspectRatioClass = aspectRatioClasses[aspectRatio]

  // If fill is false and dimensions are provided, use them directly
  if (!fill && width && height) {
    return (
      <Image
        alt={props.alt}
        src={props.src}
        onLoad={props.onLoad}
        priority={props.priority}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        loading={loading}
        className={cn('object-cover', className)}
      />
    )
  }

  // Default behavior with aspect ratio container
  return (
    <div className={cn('relative overflow-hidden', aspectRatioClass, className)}>
      <Image
        alt={props.alt}
        src={props.src}
        onLoad={props.onLoad}
        priority={props.priority}
        fill
        sizes={sizes}
        quality={quality}
        loading={loading}
        className="object-cover"
      />
    </div>
  )
}

// Higher order component for product images with specific defaults
export function ProductImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      aspectRatio="1:1"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      {...props}
    />
  )
}

// Higher order component for hero images with specific defaults
export function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      aspectRatio="21:9"
      priority
      quality={90}
      sizes="100vw"
      {...props}
    />
  )
}

// Higher order component for blog post featured images
export function BlogImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      aspectRatio="16:9"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      {...props}
    />
  )
}