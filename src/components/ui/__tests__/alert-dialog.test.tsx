import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CartClearConfirmDialog } from '../cart-clear-confirm-dialog'

describe('CartClearConfirmDialog', () => {
  it('should render confirmation dialog when open', () => {
    render(
      <CartClearConfirmDialog
        open={true}
        onOpenChange={() => {}}
        onConfirm={() => {}}
        itemCount={3}
      />
    )

    expect(screen.getByText('Clear Cart')).toBeDefined()
    expect(screen.getByText('Are you sure you want to clear your cart?')).toBeDefined()
    expect(screen.getByText('This action will remove 3 items from your cart and cannot be undone.')).toBeDefined()
  })

  it('should call onConfirm when Clear button is clicked', () => {
    const mockOnConfirm = vi.fn()
    render(
      <CartClearConfirmDialog
        open={true}
        onOpenChange={() => {}}
        onConfirm={mockOnConfirm}
        itemCount={1}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
  })

  it('should call onOpenChange with false when Cancel button is clicked', () => {
    const mockOnOpenChange = vi.fn()
    render(
      <CartClearConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={() => {}}
        itemCount={2}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('should not render when open is false', () => {
    render(
      <CartClearConfirmDialog
        open={false}
        onOpenChange={() => {}}
        onConfirm={() => {}}
        itemCount={1}
      />
    )

    expect(screen.queryByText('Clear Cart')).toBeNull()
  })

  it('should handle singular item count correctly', () => {
    render(
      <CartClearConfirmDialog
        open={true}
        onOpenChange={() => {}}
        onConfirm={() => {}}
        itemCount={1}
      />
    )

    expect(screen.getByText('This action will remove 1 item from your cart and cannot be undone.')).toBeDefined()
  })
})