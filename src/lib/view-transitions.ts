export function productImageTransitionName(slug: string) {
  return `product-image-${slug.replace(/[^a-z0-9-]/gi, '-')}`
}
