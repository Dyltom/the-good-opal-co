/**
 * Pagination helpers used by the store listing and any other
 * large collection view.
 */

export function totalPages(totalItems: number, pageSize: number): number {
  if (totalItems <= 0) return 1
  return Math.ceil(totalItems / pageSize)
}

export function clampPage(page: number, total: number): number {
  if (!Number.isFinite(page) || page < 1) return 1
  if (page > total) return total
  return Math.floor(page)
}

export function paginate<T>(items: readonly T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}
