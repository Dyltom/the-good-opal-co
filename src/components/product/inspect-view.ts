export interface Size {
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export interface View {
  scale: number
  x: number
  y: number
}

export interface Rect extends Size {
  left: number
  top: number
}

export const restingView: View = { scale: 1, x: 0, y: 0 }

export function fitRect(stage: Size, aspect: number): Rect {
  const width = Math.min(stage.width, stage.height * aspect)
  const height = width / aspect
  return { left: (stage.width - width) / 2, top: (stage.height - height) / 2, width, height }
}

function clampAxis(offset: number, shown: number, stage: number, start: number) {
  if (shown <= stage) return (stage - shown) / 2 - start
  return Math.min(-start, Math.max(stage - shown - start, offset))
}

export function clampView(view: View, stage: Size, fit: Rect): View {
  return {
    scale: view.scale,
    x: clampAxis(view.x, fit.width * view.scale, stage.width, fit.left),
    y: clampAxis(view.y, fit.height * view.scale, stage.height, fit.top),
  }
}

export function zoomAt(view: View, scale: number, point: Point, fit: Rect): View {
  const ux = (point.x - fit.left - view.x) / view.scale
  const uy = (point.y - fit.top - view.y) / view.scale
  return { scale, x: point.x - fit.left - ux * scale, y: point.y - fit.top - uy * scale }
}

export function actualPixelScale(naturalWidth: number, fitWidth: number, devicePixelRatio: number) {
  return naturalWidth / (fitWidth * devicePixelRatio)
}
