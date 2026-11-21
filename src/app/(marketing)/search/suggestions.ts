export interface SearchSuggestion {
  label: string
  href: string
  image?: string
  price?: number
  sold?: boolean
}

export interface ProductMatch {
  name: string
  slug: string
  price: number
  stock: number
  category: string
  image?: string
}

function mixCategories(matches: readonly ProductMatch[]): ProductMatch[] {
  const queues = new Map<string, ProductMatch[]>()
  for (const match of matches) queues.set(match.category, [...(queues.get(match.category) ?? []), match])

  const mixed: ProductMatch[] = []
  for (let index = 0; mixed.length < matches.length; index++) {
    for (const queue of queues.values()) {
      const match = queue[index]
      if (match) mixed.push(match)
    }
  }
  return mixed
}

export function rankProductSuggestions(matches: readonly ProductMatch[]): SearchSuggestion[] {
  const available = mixCategories(matches.filter((match) => match.stock > 0))
  const sold = matches.filter((match) => match.stock <= 0)

  return [...available, ...sold].map((match) => ({
    label: match.name,
    href: `/store/${encodeURIComponent(match.slug)}`,
    image: match.image,
    price: match.price,
    sold: match.stock <= 0,
  }))
}
