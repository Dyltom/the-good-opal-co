import { render, screen, waitFor } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { createElement } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { ViewerErrorBoundary } from '../ViewerErrorBoundary'

vi.mock('next/image', () => ({
  default: ({ fill: _fill, priority: _priority, ...props }: ComponentProps<'img'> & {
    fill?: boolean
    priority?: boolean
  }) => createElement('img', props),
}))

function Viewer({ failed, label }: { failed: boolean; label: string }) {
  if (failed) throw new Error(`Failed ${label}`)
  return <p>{label}</p>
}

describe('ViewerErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  test('recovers from a failed opal texture when the selected opal changes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { rerender } = render(
      <ViewerErrorBoundary resetKey="opal-1">
        <Viewer failed label="Opal one viewer" />
      </ViewerErrorBoundary>
    )

    expect(screen.getByText(/interactive preview could not load/i)).not.toBeNull()

    rerender(
      <ViewerErrorBoundary resetKey="opal-1">
        <Viewer failed={false} label="Opal one viewer" />
      </ViewerErrorBoundary>
    )
    expect(screen.queryByText('Opal one viewer')).toBeNull()

    rerender(
      <ViewerErrorBoundary resetKey="opal-2">
        <Viewer failed={false} label="Opal two viewer" />
      </ViewerErrorBoundary>
    )

    await waitFor(() => expect(screen.getByText('Opal two viewer')).not.toBeNull())
    expect(screen.queryByText(/interactive preview could not load/i)).toBeNull()
  })
})
