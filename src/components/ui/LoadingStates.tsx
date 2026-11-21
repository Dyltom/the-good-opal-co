export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border border-rule rounded-sm animate-pulse">
      <div className="w-24 h-24 bg-plinth-2 rounded-sm" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-plinth-2 rounded-sm w-1/2" />
        <div className="h-4 bg-plinth-2 rounded-sm w-1/4" />
        <div className="flex gap-2 mt-4">
          <div className="w-8 h-8 bg-plinth-2 rounded-sm" />
          <div className="w-16 h-8 bg-plinth-2 rounded-sm" />
          <div className="w-8 h-8 bg-plinth-2 rounded-sm" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-plinth-2 rounded-sm w-20" />
        <div className="h-4 bg-plinth-2 rounded-sm w-20" />
      </div>
    </div>
  )
}
