import { captureInsight } from './client'
import { PAGE_SECTIONS, type InsightDetail, type PageSection } from './events'

const IDLE_MS = 15_000
const MIN_PAGE_MS = 500
const RAGE_CLICKS = 3
const RAGE_WINDOW_MS = 1000
const RAGE_RADIUS_PX = 30
const MAX_RAGE_REPORTS = 5

const sectionKeys: Record<PageSection, string> = {
  photos: 'sawPhotos',
  price: 'sawPrice',
  details: 'sawDetails',
}

function scrollDepth(): number {
  const height = document.documentElement.scrollHeight
  if (height <= 0) return 100
  return Math.min(100, Math.round(((window.scrollY + window.innerHeight) / height) * 100))
}

export function trackEngagement(path: string): () => void {
  const startedAt = Date.now()
  let last = startedAt
  let engagedMs = 0
  let visible = document.visibilityState === 'visible'
  let maxScroll = scrollDepth()
  let sent = false

  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-insight-section]'))
  const present = new Set<PageSection>()
  const seen = new Set<PageSection>()
  const sectionOf = (element: Element) =>
    PAGE_SECTIONS.find((name) => name === element.getAttribute('data-insight-section'))
  for (const element of sections) {
    const name = sectionOf(element)
    if (name) present.add(name)
  }
  const observer =
    present.size > 0 && 'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const name = sectionOf(entry.target)
              if (entry.isIntersecting && name) seen.add(name)
            }
          },
          { threshold: 0.2 }
        )
      : undefined
  for (const element of sections) observer?.observe(element)

  const tick = () => {
    const now = Date.now()
    if (visible) engagedMs += Math.min(now - last, IDLE_MS)
    last = now
  }
  const onScroll = () => {
    tick()
    maxScroll = Math.max(maxScroll, scrollDepth())
  }
  const flush = () => {
    tick()
    if (sent || Date.now() - startedAt < MIN_PAGE_MS) return
    sent = true
    const detail: InsightDetail = {
      seconds: Math.min(1800, Math.round(engagedMs / 1000)),
      scroll: maxScroll,
    }
    for (const name of present) detail[sectionKeys[name]] = seen.has(name)
    captureInsight('engagement', { path, detail })
  }
  const onVisibility = () => {
    tick()
    visible = document.visibilityState === 'visible'
    if (!visible) flush()
  }

  const activity = ['pointerdown', 'keydown', 'mousemove', 'touchstart'] as const
  for (const type of activity) window.addEventListener(type, tick, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pagehide', flush)

  return () => {
    flush()
    observer?.disconnect()
    for (const type of activity) window.removeEventListener(type, tick)
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pagehide', flush)
  }
}

const CONTROLS = 'button, a, [role="button"], summary, label, select, input, textarea'

export function describeClickTarget(target: EventTarget | null): string {
  if (!(target instanceof Element)) return 'page'
  const control = target.closest(CONTROLS)
  const element = control ?? target
  const tag = element.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    const name = element.getAttribute('name')
    const type = element.getAttribute('type')
    return [tag, type && `type=${type}`, name && `name=${name}`].filter(Boolean).join(' ').slice(0, 80)
  }
  const label = (
    element.getAttribute('aria-label') ??
    element.getAttribute('alt') ??
    (control ? element.textContent : '') ??
    ''
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50)
  const section = element.closest('[data-insight-section]')?.getAttribute('data-insight-section')
  return [tag, label && `"${label}"`, section && `in ${section}`].filter(Boolean).join(' ').slice(0, 80)
}

export function trackRageClicks(): () => void {
  let clicks: { x: number; y: number; at: number }[] = []
  let reports = 0
  const onClick = (event: MouseEvent) => {
    const at = event.timeStamp
    clicks = clicks.filter(
      (click) =>
        at - click.at < RAGE_WINDOW_MS &&
        Math.hypot(click.x - event.clientX, click.y - event.clientY) < RAGE_RADIUS_PX
    )
    clicks.push({ x: event.clientX, y: event.clientY, at })
    if (clicks.length !== RAGE_CLICKS || reports >= MAX_RAGE_REPORTS) return
    reports += 1
    captureInsight('rage_click', { detail: { target: describeClickTarget(event.target) } })
  }
  document.addEventListener('click', onClick, { capture: true, passive: true })
  return () => document.removeEventListener('click', onClick, { capture: true })
}
