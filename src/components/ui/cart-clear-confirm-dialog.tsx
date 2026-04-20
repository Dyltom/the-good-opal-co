'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './alert-dialog'

interface CartClearConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  itemCount: number
}

export function CartClearConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  itemCount,
}: CartClearConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const itemText = itemCount === 1 ? '1 item' : `${itemCount} items`

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear Cart</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to clear your cart?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogDescription>
          This action will remove {itemText} from your cart and cannot be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-fire-coral hover:bg-fire-coral/90">
            Clear
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}