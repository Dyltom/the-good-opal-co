import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const refresh = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}))

import { OrderFinalizationRefresh } from '../order-finalization-refresh'

describe('checkout order finalization refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    refresh.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('polls for delayed webhook order creation and then stops', () => {
    render(<OrderFinalizationRefresh pending />)

    vi.advanceTimersByTime(20_000)
    expect(refresh).toHaveBeenCalledTimes(8)

    vi.advanceTimersByTime(10_000)
    expect(refresh).toHaveBeenCalledTimes(8)
  })

  test('does not poll after order confirmation', () => {
    render(<OrderFinalizationRefresh pending={false} />)
    vi.advanceTimersByTime(20_000)

    expect(refresh).not.toHaveBeenCalled()
  })
})
