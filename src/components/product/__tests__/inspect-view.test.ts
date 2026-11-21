import { describe, expect, test } from 'vitest'
import { clampView, fitRect, restingView, zoomAt, type Point, type Rect, type View } from '../inspect-view'

const stage = { width: 1000, height: 800 }
const fit = fitRect(stage, 4 / 5)

function photoPoint(view: View, point: Point, rect: Rect): Point {
  return {
    x: (point.x - rect.left - view.x) / (view.scale * rect.width),
    y: (point.y - rect.top - view.y) / (view.scale * rect.height),
  }
}

describe('inspect view', () => {
  test('fits a portrait photo to the stage height, centred', () => {
    expect(fit).toEqual({ left: 180, top: 0, width: 640, height: 800 })
  })

  test('zooming keeps the part of the stone under the pointer in place', () => {
    const pointer = { x: 610, y: 260 }
    const before = photoPoint(restingView, pointer, fit)
    const zoomed = zoomAt(restingView, 3, pointer, fit)
    expect(photoPoint(zoomed, pointer, fit).x).toBeCloseTo(before.x)
    expect(photoPoint(zoomed, pointer, fit).y).toBeCloseTo(before.y)

    const deeper = zoomAt(zoomed, 5.5, { x: 300, y: 700 }, fit)
    const target = photoPoint(zoomed, { x: 300, y: 700 }, fit)
    expect(photoPoint(deeper, { x: 300, y: 700 }, fit).x).toBeCloseTo(target.x)
    expect(photoPoint(deeper, { x: 300, y: 700 }, fit).y).toBeCloseTo(target.y)
  })

  test('a zoomed photo cannot be dragged off the stage', () => {
    const dragged = clampView({ scale: 3, x: 5000, y: -9000 }, stage, fit)
    const width = fit.width * 3
    const height = fit.height * 3
    expect(fit.left + dragged.x).toBe(0)
    expect(fit.top + dragged.y + height).toBe(stage.height)
    expect(fit.left + dragged.x + width).toBeGreaterThan(stage.width)
  })

  test('an axis smaller than the stage stays centred', () => {
    const view = clampView({ scale: 1.2, x: 400, y: 0 }, stage, fit)
    expect(fit.left + view.x + (fit.width * 1.2) / 2).toBeCloseTo(stage.width / 2)
  })
})
