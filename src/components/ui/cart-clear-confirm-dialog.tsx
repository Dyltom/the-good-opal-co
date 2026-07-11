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
          <AlertDialogTitle>Remove every item?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes {itemText} from your cart. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep items</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-fire-coral hover:bg-fire-coral/90"
          >
            Clear cart
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
