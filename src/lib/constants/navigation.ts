export interface NavigationItem {
  href: string
  label: string
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: '/store', label: 'Shop' },
  { href: '/services', label: 'Custom rings' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'Our story' },
  { href: '/blog', label: 'Journal' },
]
